using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Xml.Linq;
using Microsoft.Extensions.Options;

namespace Store.Service.ProviderService;

public class MellatPaymentOptions
{
    public const string SectionName = "Mellat";

    public long TerminalId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserPassword { get; set; } = string.Empty;
    public string ServiceUrl { get; set; } = string.Empty;
    public string GatewayUrl { get; set; } = string.Empty;
    public string CallbackUrl { get; set; } = string.Empty;
    public string ResultUrl { get; set; } = string.Empty;
}

public record MellatPayResponse(string ResponseCode, string? RefId);

public class MellatPaymentService(HttpClient httpClient, IOptions<MellatPaymentOptions> options)
{
    private static readonly XNamespace SoapNamespace = "http://schemas.xmlsoap.org/soap/envelope/";
    private static readonly XNamespace ServiceNamespace = "http://interfaces.core.sw.bps.com/";
    private static readonly TimeZoneInfo IranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");

    public MellatPaymentOptions Settings => ValidateSettings();

    public async Task<MellatPayResponse> PayAsync(long orderId, long amount,
        CancellationToken cancellation)
    {
        var settings = ValidateSettings();
        var now = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, IranTimeZone);
        var response = await CallAsync("bpPayRequest",
        [
            Pair("terminalId", settings.TerminalId),
            Pair("userName", settings.UserName),
            Pair("userPassword", settings.UserPassword),
            Pair("orderId", orderId),
            Pair("amount", amount),
            Pair("localDate", now.ToString("yyyyMMdd", CultureInfo.InvariantCulture)),
            Pair("localTime", now.ToString("HHmmss", CultureInfo.InvariantCulture)),
            Pair("additionalData", string.Empty),
            Pair("callBackUrl", settings.CallbackUrl),
            Pair("payerId", 0),
            Pair("mobileNo", string.Empty),
            Pair("encPan", string.Empty),
            Pair("panHiddenMode", string.Empty),
            Pair("cartItem", string.Empty),
            Pair("enc", string.Empty)
        ], cancellation);

        var parts = response.Split(',', 2, StringSplitOptions.TrimEntries);
        return new MellatPayResponse(parts[0], parts.Length == 2 ? parts[1] : null);
    }

    public Task<string> VerifyAsync(long orderId, long saleReferenceId, CancellationToken cancellation) =>
        CallTransactionAsync("bpVerifyRequest", orderId, saleReferenceId, cancellation);

    public Task<string> SettleAsync(long orderId, long saleReferenceId, CancellationToken cancellation) =>
        CallTransactionAsync("bpSettleRequest", orderId, saleReferenceId, cancellation);

    public Task<string> InquiryAsync(long orderId, long saleReferenceId, CancellationToken cancellation) =>
        CallTransactionAsync("bpInquiryRequest", orderId, saleReferenceId, cancellation);

    private Task<string> CallTransactionAsync(string method, long orderId, long saleReferenceId,
        CancellationToken cancellation)
    {
        var settings = ValidateSettings();
        return CallAsync(method,
        [
            Pair("terminalId", settings.TerminalId),
            Pair("userName", settings.UserName),
            Pair("userPassword", settings.UserPassword),
            Pair("orderId", orderId),
            Pair("saleOrderId", orderId),
            Pair("saleReferenceId", saleReferenceId)
        ], cancellation);
    }

    private async Task<string> CallAsync(string method, IReadOnlyCollection<KeyValuePair<string, string>> parameters,
        CancellationToken cancellation)
    {
        var settings = ValidateSettings();
        var operation = new XElement(ServiceNamespace + method,
            parameters.Select(x => new XElement(x.Key, x.Value)));
        var envelope = new XDocument(
            new XElement(SoapNamespace + "Envelope",
                new XAttribute(XNamespace.Xmlns + "soapenv", SoapNamespace),
                new XAttribute(XNamespace.Xmlns + "ser", ServiceNamespace),
                new XElement(SoapNamespace + "Header"),
                new XElement(SoapNamespace + "Body", operation)));

        using var request = new HttpRequestMessage(HttpMethod.Post, settings.ServiceUrl)
        {
            Content = new StringContent(envelope.ToString(SaveOptions.DisableFormatting), Encoding.UTF8, "text/xml")
        };
        request.Headers.TryAddWithoutValidation("SOAPAction", "\"\"");
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("text/xml") { CharSet = "utf-8" };

        using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellation);
        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(cancellation);
        var document = await XDocument.LoadAsync(stream, LoadOptions.None, cancellation);
        if (document.Descendants().Any(x => x.Name.LocalName == "Fault"))
            throw new InvalidOperationException("Mellat gateway returned a SOAP fault");

        var result = document.Descendants().FirstOrDefault(x => x.Name.LocalName == "return")?.Value;
        if (string.IsNullOrWhiteSpace(result))
            throw new InvalidOperationException("Mellat gateway returned an invalid response");

        return result.Trim();
    }

    private MellatPaymentOptions ValidateSettings()
    {
        var settings = options.Value;
        if (settings.TerminalId <= 0 ||
            string.IsNullOrWhiteSpace(settings.UserName) ||
            string.IsNullOrWhiteSpace(settings.UserPassword) ||
            !Uri.TryCreate(settings.ServiceUrl, UriKind.Absolute, out _) ||
            !Uri.TryCreate(settings.GatewayUrl, UriKind.Absolute, out _) ||
            !Uri.TryCreate(settings.CallbackUrl, UriKind.Absolute, out _))
            throw new InvalidOperationException("Mellat payment configuration is missing or invalid");

        return settings;
    }

    private static KeyValuePair<string, string> Pair(string key, object value) =>
        new(key, Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty);
}

using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Store.Service.ProviderService;

public class KavenegarOptions
{
    public const string SectionName = "Kavenegar";

    public string ApiKey { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;
    public string WelcomeTemplate { get; set; } = string.Empty;
    public string DiscountTemplate { get; set; } = string.Empty;
}

public class KavenegarSmsService(HttpClient httpClient, IOptions<KavenegarOptions> options)
{
    private static readonly PersianCalendar PersianCalendar = new();
    private static readonly TimeZoneInfo IranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");

    public async Task SendVerificationCodeAsync(string phoneNumber, string code, CancellationToken cancellation)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.Template))
            throw new InvalidOperationException("Kavenegar configuration is missing");

        await SendLookupAsync(settings.ApiKey, new Dictionary<string, string>
        {
            ["receptor"] = phoneNumber,
            ["token"] = code,
            ["template"] = settings.Template
        }, cancellation);
    }

    public async Task SendWelcomeDiscountAsync(string phoneNumber, string code, decimal amountToman,
        decimal minimumPurchaseAmountToman, DateTime expireAt, CancellationToken cancellation)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.WelcomeTemplate))
            throw new InvalidOperationException("Kavenegar welcome template configuration is missing");

        await SendDiscountAsync(settings.ApiKey, settings.WelcomeTemplate, phoneNumber, code, amountToman,
            minimumPurchaseAmountToman, expireAt, cancellation);
    }

    public async Task SendAssignedDiscountAsync(string phoneNumber, string code, decimal amountToman,
        decimal minimumPurchaseAmountToman, DateTime? expireAt, CancellationToken cancellation)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.DiscountTemplate))
            throw new InvalidOperationException("Kavenegar discount template configuration is missing");

        await SendDiscountAsync(settings.ApiKey, settings.DiscountTemplate, phoneNumber, code, amountToman,
            minimumPurchaseAmountToman, expireAt, cancellation);
    }

    private async Task SendDiscountAsync(string apiKey, string template, string phoneNumber, string code,
        decimal amountToman, decimal minimumPurchaseAmountToman, DateTime? expireAt,
        CancellationToken cancellation)
    {
        var formattedExpireAt = expireAt.HasValue ? FormatPersianDate(expireAt.Value) : "بدون محدودیت";
        await SendLookupAsync(apiKey, new Dictionary<string, string>
        {
            ["receptor"] = phoneNumber,
            ["token"] = code,
            ["token2"] = amountToman.ToString("0", CultureInfo.InvariantCulture),
            ["token3"] = minimumPurchaseAmountToman.ToString("0", CultureInfo.InvariantCulture),
            ["token10"] = formattedExpireAt,
            ["template"] = template
        }, cancellation);
    }

    private static string FormatPersianDate(DateTime value)
    {
        var localValue = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(value, DateTimeKind.Utc), IranTimeZone);
        return $"{PersianCalendar.GetYear(localValue):0000}/" +
               $"{PersianCalendar.GetMonth(localValue):00}/" +
               $"{PersianCalendar.GetDayOfMonth(localValue):00}";
    }

    private async Task SendLookupAsync(string apiKey, Dictionary<string, string> parameters,
        CancellationToken cancellation)
    {
        using var content = new FormUrlEncodedContent(parameters);

        using var response = await httpClient.PostAsync(
            $"v1/{Uri.EscapeDataString(apiKey)}/verify/lookup.json",
            content,
            cancellation);

        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellation);
        using var responseJson = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellation);
        var result = responseJson.RootElement.GetProperty("return");
        var status = result.GetProperty("status").GetInt32();

        if (status != 200)
        {
            var message = result.GetProperty("message").GetString();
            throw new InvalidOperationException($"Kavenegar SMS request failed with status {status}: {message}");
        }
    }
}

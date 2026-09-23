using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Store.Service.ProviderService;

public class KavenegarOptions
{
    public const string SectionName = "Kavenegar";

    public string ApiKey { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;
}

public class KavenegarSmsService(HttpClient httpClient, IOptions<KavenegarOptions> options)
{
    public async Task SendVerificationCodeAsync(string phoneNumber, string code, CancellationToken cancellation)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.Template))
            throw new InvalidOperationException("Kavenegar configuration is missing");

        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["receptor"] = phoneNumber,
            ["token"] = code,
            ["token2"] = code,
            ["template"] = settings.Template
        });

        using var response = await httpClient.PostAsync(
            $"v1/{Uri.EscapeDataString(settings.ApiKey)}/verify/lookup.json",
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
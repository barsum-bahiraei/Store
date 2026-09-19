using System.Text.Json;
using System.Text.Json.Serialization;

namespace Store.Domain.Products.Models.Input;

public class ProductTorobInput
{
    [JsonPropertyName("page_urls")]
    public List<string>? PageUrls { get; set; }

    [JsonPropertyName("page_uniques")]
    public List<string>? PageUniques { get; set; }

    [JsonPropertyName("page")]
    public int? Page { get; set; }

    [JsonPropertyName("sort")]
    public string? Sort { get; set; }

    [JsonPropertyName("cursor")]
    public string? Cursor { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? AdditionalData { get; set; }

    [JsonIgnore]
    public List<int>? ProductIds { get; set; }

    [JsonIgnore]
    public int? CursorId { get; set; }
}

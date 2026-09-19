using System.Text.Json.Serialization;

namespace Store.Domain.Products.Models.Output;

public class ProductTorobOutput
{
    [JsonPropertyName("api_version")]
    public string ApiVersion { get; set; }

    [JsonPropertyName("current_page")]
    public int CurrentPage { get; set; }

    [JsonPropertyName("total")]
    public int? Total { get; set; }

    [JsonPropertyName("max_pages")]
    public int? MaxPages { get; set; }

    [JsonPropertyName("next_cursor")]
    public string? NextCursor { get; set; }

    [JsonPropertyName("products")]
    public List<ProductTorobItemOutput> Products { get; set; }
}

public class ProductTorobItemOutput
{
    [JsonPropertyName("page_unique")]
    public string PageUnique { get; set; }

    [JsonPropertyName("page_url")]
    public string PageUrl { get; set; }

    [JsonPropertyName("product_group_id")]
    public string? ProductGroupId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("subtitle")]
    public string? Subtitle { get; set; }

    [JsonPropertyName("current_price")]
    public long CurrentPrice { get; set; }

    [JsonPropertyName("old_price")]
    public long? OldPrice { get; set; }

    [JsonPropertyName("availability")]
    public bool Availability { get; set; }

    [JsonPropertyName("category_name")]
    public string? CategoryName { get; set; }

    [JsonPropertyName("image_links")]
    public List<string> ImageLinks { get; set; }

    [JsonPropertyName("spec")]
    public Dictionary<string, string> Spec { get; set; }

    [JsonPropertyName("guarantee")]
    public string? Guarantee { get; set; }

    [JsonPropertyName("short_desc")]
    public string? ShortDescription { get; set; }

    [JsonPropertyName("date_added")]
    public string DateAdded { get; set; }

    [JsonPropertyName("date_updated")]
    public string DateUpdated { get; set; }

    [JsonPropertyName("seller_name")]
    public string? SellerName { get; set; }

    [JsonPropertyName("seller_city")]
    public string? SellerCity { get; set; }
}

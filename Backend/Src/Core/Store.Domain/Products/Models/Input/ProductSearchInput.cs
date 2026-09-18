namespace Store.Domain.Products.Models.Input;

public class ProductSearchInput
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public int? ProductBrandId { get; set; }
    public bool HasDiscount { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool IsPriceDec { get; set; }
    public bool IsIdDec { get; set; }
    public bool? IsAvailable { get; set; }
}

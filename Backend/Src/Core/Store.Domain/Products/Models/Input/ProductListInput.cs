namespace Store.Domain.Products.Models.Input;

public class ProductListFilterInput
{
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public int? ProductBrandId { get; set; }
    public int? SellerId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsAvailable { get; set; }
}

public class ProductListInput : ProductListFilterInput
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

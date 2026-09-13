namespace Store.Domain.Products.Models.Input;

public class ProductSearchInput
{
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public bool HasDiscount { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}

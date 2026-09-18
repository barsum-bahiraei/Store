namespace Store.Domain.Products.Models.Input;

public class ProductListInput
{
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public int? SellerId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsAvailable { get; set; }
}

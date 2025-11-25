namespace Store.Domain.Products.Models.Input;

public class ProductCreateInput
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
}
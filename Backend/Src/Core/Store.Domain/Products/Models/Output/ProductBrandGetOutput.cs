namespace Store.Domain.Products.Models.Output;

public class ProductBrandGetOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ProductBrandImageOutput? Image { get; set; }
}

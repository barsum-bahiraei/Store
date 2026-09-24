namespace Store.Domain.Products.Models.Output;

public class ProductCombinationOutput
{
    public int Id { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public List<ProductVariantAttributeValueOutput> Values { get; set; }
}

public class ProductVariantAttributeValueOutput
{
    public int Id { get; set; }
    public string Size { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}

namespace Store.Domain.Products.Models.Input;

public class ProductUpdateInput
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public List<ProductAttributeUpdateInput> Attributes { get; set; }
}

public class ProductAttributeUpdateInput
{
    public int AttributeId { get; set; }
    public string Value { get; set; }
}
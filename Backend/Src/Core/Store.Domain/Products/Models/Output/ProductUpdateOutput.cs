namespace Store.Domain.Products.Models.Output;

public class ProductUpdateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public List<ProductAttributeUpdateOutput> Attributes { get; set; }
}

public class ProductAttributeUpdateOutput
{
    public int Id { get; set; }
    public int AttributeId { get; set; }
    public string Value { get; set; }
}
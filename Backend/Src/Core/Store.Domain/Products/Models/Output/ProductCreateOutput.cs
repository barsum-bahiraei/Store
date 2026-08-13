namespace Store.Domain.Products.Models.Output;

public class ProductCreateOutput
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public List<ProductAttributeOutput> Attributes { get; set; }
}

public class ProductAttributeOutput
{
    public int AttributeId { get; set; }
    public string Value { get; set; }
}
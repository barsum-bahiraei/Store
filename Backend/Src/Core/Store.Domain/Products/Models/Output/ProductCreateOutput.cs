namespace Store.Domain.Products.Models.Output;

public class ProductCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int SellerId { get; set; }
    public int CategoryId { get; set; }
    public int? ProductBrandId { get; set; }
    public List<ProductAttributeOutput> Attributes { get; set; }
    public List<ProductVariantCreateOutput> Variants { get; set; }
}

public class ProductAttributeOutput
{
    public int Id { get; set; }
    public int AttributeId { get; set; }
    public string Value { get; set; }
}

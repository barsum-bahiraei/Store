namespace Store.Domain.Products.Models.Input;

public class ProductCreateInput
{
    public string Name { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public int SellerId { get; set; }
    public int ProductBrandId { get; set; }
    public bool IsAvailable { get; set; } = true;
    public List<ProductAttributeInput> Attributes { get; set; }
    public List<int> ProductVariantIds { get; set; }
}

public class ProductAttributeInput
{
    public int AttributeId { get; set; }
    public string Value { get; set; }
}

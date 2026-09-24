namespace Store.Domain.Products.Models.Input;

public class ProductCreateInput
{
    public string Name { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public int SellerId { get; set; }
    public int ProductBrandId { get; set; }
    public List<ProductAttributeInput> Attributes { get; set; }
    public List<ProductCombinationCreateInput> Variants { get; set; }
}

public class ProductCombinationCreateInput
{
    public List<ProductVariantAttributeValueInput> Values { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

public class ProductVariantAttributeValueInput
{
    public string Size { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}

public class ProductAttributeInput
{
    public int AttributeId { get; set; }
    public string Value { get; set; }
}

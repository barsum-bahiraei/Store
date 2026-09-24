namespace Store.Domain.Products;

public class ProductVariantAttributeValueEntity : BaseEntity
{
    public int ProductVariantId { get; set; }
    public string Size { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public ProductVariantEntity ProductVariant { get; set; }
}

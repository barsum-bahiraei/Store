namespace Store.Domain.Products;

public class ProductVariantAttributeValueEntity : BaseEntity
{
    public int ProductVariantId { get; set; }
    public string Size { get; set; }
    public string ColorName { get; set; }
    public string ColorCode { get; set; }
    public ProductVariantEntity ProductVariant { get; set; }
}

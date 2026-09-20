namespace Store.Domain.Products;

public class ProductVariantEntity : BaseEntity
{
    public int ProductId { get; set; }
    public int VariantId { get; set; }
    public ProductEntity Product { get; set; }
    public VariantEntity Variant { get; set; }
}

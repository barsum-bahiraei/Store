namespace Store.Domain.Products;

public class VariantEntity : BaseEntity
{
    public string Name { get; set; }
    public string Code { get; set; }
    public ICollection<ProductVariantEntity> ProductVariants { get; set; }
}
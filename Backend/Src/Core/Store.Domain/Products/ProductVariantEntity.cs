namespace Store.Domain.Products;

public class ProductVariantEntity : BaseEntity
{
    public string ColorName { get; set; }
    public string ColorCode { get; set; }
    public ICollection<ProductEntity> Products { get; set; }
}

namespace Store.Domain.Products;

public class ProductBrandEntity : BaseEntity
{
    public string Name { get; set; }
    public ICollection<ProductEntity> Products { get; set; }
}

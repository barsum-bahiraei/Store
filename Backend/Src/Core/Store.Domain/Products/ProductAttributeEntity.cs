namespace Store.Domain.Products;

public class ProductAttributeEntity : BaseEntity
{
    public string Name { get; set; }
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
}
namespace Store.Domain.Products;

public class ProductVariantEntity : BaseEntity
{
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string CombinationKey { get; set; }
    public ProductEntity Product { get; set; }
    public ICollection<ProductVariantAttributeValueEntity> AttributeValues { get; set; }
}

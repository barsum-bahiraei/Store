namespace Store.Domain.Products;

public class ProductImageEntity: BaseEntity
{
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
}
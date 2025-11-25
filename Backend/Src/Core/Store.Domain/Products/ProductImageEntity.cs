namespace Store.Domain.Products;

public class ProductImageEntity : BaseEntity
{
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public bool IsMain { get; set; }
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
}
namespace Store.Domain.Products;

public class ProductColorEntity : BaseEntity
{
    public string Name { get; set; }
    public string HexCode { get; set; }
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
}
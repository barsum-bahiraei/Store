namespace Store.Domain.Products;

public class ProductCommentEntity : BaseEntity
{
    public string Text { get; set; }
    public int Score { get; set; }
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
}
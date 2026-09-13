using Store.Domain.Accounts;

namespace Store.Domain.Products;

public class ProductCommentEntity : BaseEntity
{
    public string Text { get; set; }
    public byte? Rating { get; set; }
    public bool? IsShow { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
    public UserEntity User { get; set; }
}
using Store.Domain.Accounts;

namespace Store.Domain.Products;

public class ProductBookmarkEntity : BaseEntity
{
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }
    public int UserId { get; set; }
    public UserEntity User { get; set; }
}
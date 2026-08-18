using Store.Domain.Accounts;
using Store.Domain.Products;

namespace Store.Domain.Sellers;

public class SellerEntity : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public SellerStatusEnum Status { get; set; }
    public int UserId { get; set; }
    public UserEntity User { get; set; }
    public ICollection<ProductEntity> Products { get; set; }
}
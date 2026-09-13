using Store.Domain.Accounts;
using Store.Domain.Products;

namespace Store.Domain.Invoices;

public class PreInvoiceEntity : BaseEntity
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int ProductCount { get; set; }
    public UserEntity User { get; set; }
    public ProductEntity Product { get; set; }
}
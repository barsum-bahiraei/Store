using Store.Domain.Accounts;
using Store.Domain.Products;

namespace Store.Domain.Invoices;

public class InvoiceEntity : BaseEntity
{
    public int ProductCount { get; set; }
    public decimal ProductPrice { get; set; }
    public PaymentMethodEnum PaymentMethod { get; set; }
    public DeliveryMethodEnum DeliveryMethod { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public UserEntity User { get; set; }
    public ProductEntity Product { get; set; }
}

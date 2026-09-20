using Store.Domain.Accounts;
using Store.Domain.Products;

namespace Store.Domain.Invoices;

public class InvoiceEntity : BaseEntity
{
    public PaymentMethodEnum PaymentMethod { get; set; }
    public DeliveryMethodEnum DeliveryMethod { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }

    public int UserId { get; set; }
    public int? DiscountCodeId { get; set; }
    
    public UserEntity User { get; set; }
    public DiscountCodeEntity? DiscountCode { get; set; }
    public ICollection<InvoiceItemEntity> InvoiceItems { get; set; }
    public ICollection<PaymentEntity> Payments { get; set; }
}

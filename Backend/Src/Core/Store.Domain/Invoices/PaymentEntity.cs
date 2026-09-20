using Store.Domain.Accounts;

namespace Store.Domain.Invoices;

public class PaymentEntity : BaseEntity
{
    public decimal Amount { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }
    public PaymentMethodEnum PaymentMethod { get; set; }
    public int InvoiceId { get; set; }
    public InvoiceEntity Invoice { get; set; }

    // اطلاعات بانک
}
using Store.Domain.Accounts;

namespace Store.Domain.Invoices;

public class PaymentEntity : BaseEntity
{
    public decimal Amount { get; set; }
    public decimal? PaidAmount { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }
    public PaymentMethodEnum PaymentMethod { get; set; }
    public long? OrderId { get; set; }
    public string? RefId { get; set; }
    public long? SaleReferenceId { get; set; }
    public string? CardHolderPan { get; set; }
    public string? PayResponseCode { get; set; }
    public string? CallbackResponseCode { get; set; }
    public string? VerifyResponseCode { get; set; }
    public string? SettleResponseCode { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? SettledAt { get; set; }
    public int InvoiceId { get; set; }
    public InvoiceEntity Invoice { get; set; }
}

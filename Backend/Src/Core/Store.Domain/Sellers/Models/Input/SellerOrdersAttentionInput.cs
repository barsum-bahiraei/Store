using Store.Domain.Invoices;

namespace Store.Domain.Sellers.Models.Input;

public class SellerOrdersAttentionInput
{
    public int? InvoiceId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public PaymentStatusEnum? PaymentStatus { get; set; }
}

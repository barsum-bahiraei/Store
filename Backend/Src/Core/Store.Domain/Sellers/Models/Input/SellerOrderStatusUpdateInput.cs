using Store.Domain.Invoices;

namespace Store.Domain.Sellers.Models.Input;

public class SellerOrderStatusUpdateInput
{
    public PaymentStatusEnum PaymentStatus { get; set; }
}

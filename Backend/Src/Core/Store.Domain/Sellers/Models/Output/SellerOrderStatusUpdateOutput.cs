using Store.Domain.Invoices;

namespace Store.Domain.Sellers.Models.Output;

public class SellerOrderStatusUpdateOutput
{
    public int Id { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }
}

using Store.Domain.Invoices;

namespace Store.Domain.Sellers.Models.Output;

public class SellerOrderStatusListOutput
{
    public PaymentStatusEnum PaymentStatus { get; set; }
    public int Count { get; set; }
}

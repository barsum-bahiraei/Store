using Store.Domain.Invoices;

namespace Store.Domain.Sellers.Models.Output;

public class SellerOrderAttentionListOutput
{
    public int Id { get; set; }
    public decimal TotalPrice { get; set; }
    public int TotalCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }
    public PaymentMethodEnum PaymentMethod { get; set; }
    public DeliveryMethodEnum DeliveryMethod { get; set; }
    public string Address { get; set; }
}

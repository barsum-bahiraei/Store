namespace Store.Domain.Invoices.Models.Output;

public class CheckoutOutput
{
    public int InvoiceId { get; set; }
    public int PaymentId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }
}

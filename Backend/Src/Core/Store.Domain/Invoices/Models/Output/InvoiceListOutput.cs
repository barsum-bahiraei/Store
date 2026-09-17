namespace Store.Domain.Invoices.Models.Output;

public class InvoiceListOutput
{
    public int Id { get; set; }
    public decimal TotalPrice { get; set; }
    public int TotalCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Address { get; set; }
    public PaymentMethodEnum PaymentMethod { get; set; }
    public DeliveryMethodEnum DeliveryMethod { get; set; }
}

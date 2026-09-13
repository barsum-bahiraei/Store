namespace Store.Domain.Invoices.Models.Output;

public class InvoiceListOutput
{
    public int Id { get; set; }
    public decimal TotalPrice { get; set; }
    public int TotalCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
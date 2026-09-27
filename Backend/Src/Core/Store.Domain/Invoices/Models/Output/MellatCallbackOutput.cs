namespace Store.Domain.Invoices.Models.Output;

public class MellatCallbackOutput
{
    public bool IsSuccessful { get; set; }
    public bool IsPending { get; set; }
    public int? InvoiceId { get; set; }
}

namespace Store.Domain.Invoices.Models.Input;

public class MellatCallbackInput
{
    public string? RefId { get; set; }
    public string? ResCode { get; set; }
    public long? SaleOrderId { get; set; }
    public long? SaleReferenceId { get; set; }
    public string? CardHolderPan { get; set; }
    public long? FinalAmount { get; set; }
}

namespace Store.Domain.Invoices.Models.Output;

public class DiscountCodeValidateOutput
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public decimal MinimumPurchaseAmount { get; set; }
    public PaymentMethodEnum? PaymentMethod { get; set; }
    public DateTime? ExpireAt { get; set; }
}

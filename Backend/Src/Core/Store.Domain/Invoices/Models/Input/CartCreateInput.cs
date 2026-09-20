namespace Store.Domain.Invoices.Models.Input;

public class CartCreateInput
{
    public int ProductId { get; set; }
    public int ProductVariantId { get; set; }
    public int ProductCount { get; set; }
}

namespace Store.Domain.Invoices.Models.Input;

public class CheckoutInput
{
    public PaymentMethodEnum PaymentMethod { get; set; }
    public DeliveryMethodEnum DeliveryMethod { get; set; }
    public string? DiscountCode { get; set; }
}

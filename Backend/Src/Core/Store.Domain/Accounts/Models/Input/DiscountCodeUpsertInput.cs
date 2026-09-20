using Store.Domain.Invoices;

namespace Store.Domain.Accounts.Models.Input;

public class DiscountCodeUpsertInput
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public PaymentMethodEnum? PaymentMethod { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public List<int> UserIds { get; set; } = [];
}

using Store.Domain.Accounts;
using Store.Domain.Invoices;

namespace Store.Domain.Accounts;

public class DiscountCodeEntity : BaseEntity
{
    public string Code { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public PaymentMethodEnum? PaymentMethod { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }

    public ICollection<UserDiscountCodeEntity> UserDiscountCodes { get; set; }
}
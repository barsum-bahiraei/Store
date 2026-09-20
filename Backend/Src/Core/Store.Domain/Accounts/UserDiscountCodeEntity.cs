using Store.Domain.Invoices;

namespace Store.Domain.Accounts;

public class UserDiscountCodeEntity : BaseEntity
{
    public int UserId { get; set; }
    public int DiscountCodeId { get; set; }

    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }

    public UserEntity User { get; set; }
    public DiscountCodeEntity DiscountCode { get; set; }
}
namespace Store.Domain.Accounts;

public class VerificationCodeEntity : BaseEntity
{
    public string PhoneNumber { get; set; }
    public string CodeHash { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}

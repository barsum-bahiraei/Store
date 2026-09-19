namespace Store.Domain.Accounts.Models.Output;

public class UserOtpVerifyOutput
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; }
    public bool IsNewUser { get; set; }
    public string Token { get; set; }
}

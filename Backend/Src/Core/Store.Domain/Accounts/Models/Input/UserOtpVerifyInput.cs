namespace Store.Domain.Accounts.Models.Input;

public class UserOtpVerifyInput
{
    public string PhoneNumber { get; set; }
    public string Code { get; set; }
}

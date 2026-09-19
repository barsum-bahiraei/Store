namespace Store.Domain.Accounts.Models.Input;

public class UserProfileUpdateInput
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public GenderTypeEnum Gender { get; set; }
    public string? NationalCode { get; set; }
    public string? BirthDate { get; set; }
}

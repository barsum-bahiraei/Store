namespace Store.Domain.Accounts.Models.Output;

public class UserProfileUpdateOutput
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public GenderTypeEnum Gender { get; set; }
    public string? NationalCode { get; set; }
    public string? BirthDate { get; set; }
}

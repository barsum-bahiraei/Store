namespace Store.Domain.Sellers.Models.Input;

public class SellerUpdateInput
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public string Address { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public SellerStatusEnum Status { get; set; }
}

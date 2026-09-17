namespace Store.Domain.Sellers.Models.Output;

public class SellerCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string Address { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public SellerStatusEnum Status { get; set; }
    
}

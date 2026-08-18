namespace Store.Domain.Sellers.Models.Output;

public class SellerCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public SellerStatusEnum Status { get; set; }
    
}
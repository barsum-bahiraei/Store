namespace Store.Domain.Sellers.Models.Input;

public class SellerUpdateInput
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public SellerStatusEnum Status { get; set; }
}
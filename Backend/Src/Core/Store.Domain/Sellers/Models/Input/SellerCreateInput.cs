using System.ComponentModel.DataAnnotations;

namespace Store.Domain.Sellers.Models.Input;

public class SellerCreateInput
{
    public string Name { get; set; }
    public string Description { get; set; }
    [Required]
    public string Address { get; set; }
    [Required]
    public double Latitude { get; set; }
    [Required]
    public double Longitude { get; set; }
}

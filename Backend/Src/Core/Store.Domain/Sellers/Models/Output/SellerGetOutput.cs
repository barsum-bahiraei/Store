using Store.Domain.Files;

namespace Store.Domain.Sellers.Models.Output;

public class SellerGetOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string Address { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public SellerStatusEnum Status { get; set; }
    public List<SellerImageGetOutput> Images { get; set; }
}

public class SellerImageGetOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

using Store.Domain.Files;

namespace Store.Domain.Products.Models.Output;

public class ProductSearchOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public ProductImageSearchOutput? Image { get; set; }
}

public class ProductImageSearchOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

using Store.Domain.Files;

namespace Store.Domain.Products.Models.Output;

public class ProductListOutput
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public ProductImageListOutput? Image { get; set; }
}

public class ProductImageListOutput
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}
using Store.Domain.Files;

namespace Store.Domain.Products.Models.Output;

public class ProductBookmarkListOutput
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public ProductBookmarkProductOutput Product { get; set; }
}

public class ProductBookmarkProductOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? ShortDescription { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public ProductBookmarkImageOutput? Image { get; set; }
}

public class ProductBookmarkImageOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

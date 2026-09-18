using Store.Domain.Files;

namespace Store.Domain.Products.Models.Output;

public class ProductBrandListOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ProductBrandImageOutput? Image { get; set; }
}

public class ProductBrandImageOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

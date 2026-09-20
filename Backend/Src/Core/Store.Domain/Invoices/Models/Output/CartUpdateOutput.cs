using Store.Domain.Files;

namespace Store.Domain.Invoices.Models.Output;

public class CartUpdateOutput
{
    public int Id { get; set; }
    public int ProductCount { get; set; }
    public CartProductUpdateOutput Product { get; set; }
}

public class CartProductUpdateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public CartProductImageUpdateOutput? Image { get; set; }
}

public class CartProductImageUpdateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

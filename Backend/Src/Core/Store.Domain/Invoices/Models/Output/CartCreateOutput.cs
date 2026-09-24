using Store.Domain.Files;

namespace Store.Domain.Invoices.Models.Output;

public class CartCreateOutput
{
    public int Id { get; set; }
    public int ProductCount { get; set; }
    public int ProductVariantId { get; set; }
    public CartProductVariantOutput Variant { get; set; }
    public CartProductCreateOutput Product { get; set; }
}

public class CartProductCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public CartProductImageCreateOutput? Image { get; set; }
}

public class CartProductImageCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

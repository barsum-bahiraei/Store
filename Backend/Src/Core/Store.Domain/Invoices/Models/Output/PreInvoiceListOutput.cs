using Store.Domain.Files;

namespace Store.Domain.Invoices.Models.Output;

public class PreInvoiceListOutput
{
    public int Id { get; set; }
    public int ProductCount { get; set; }
    public PreInvoiceProductListOutput Product { get; set; }
}

public class PreInvoiceProductListOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public PreInvoiceProductImageListOutput? Image { get; set; }
}

public class PreInvoiceProductImageListOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}
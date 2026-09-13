using Store.Domain.Files;

namespace Store.Domain.Invoices.Models.Output;

public class PreInvoiceUpdateOutput
{
    public int Id { get; set; }
    public int ProductCount { get; set; }
    public PreInvoiceProductUpdateOutput Product { get; set; }
}

public class PreInvoiceProductUpdateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public PreInvoiceProductImageUpdateOutput? Image { get; set; }
}

public class PreInvoiceProductImageUpdateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

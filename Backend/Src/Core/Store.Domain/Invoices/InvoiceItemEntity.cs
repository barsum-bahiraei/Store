using Store.Domain.Products;

namespace Store.Domain.Invoices;

public class InvoiceItemEntity : BaseEntity
{
    public int ProductCount { get; set; }
    public decimal ProductPrice { get; set; }
    public int ProductId { get; set; }
    public int ProductVariantId { get; set; }
    public int InvoiceId { get; set; }
    public ProductEntity Product { get; set; }
    public ProductVariantEntity ProductVariant { get; set; }
    public InvoiceEntity Invoice { get; set; }
}

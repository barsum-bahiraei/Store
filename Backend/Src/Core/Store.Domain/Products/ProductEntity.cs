using Store.Domain.Categories;
using Store.Domain.Invoices;
using Store.Domain.Sellers;

namespace Store.Domain.Products;

public class ProductEntity : BaseEntity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public int SellerId { get; set; }
    public CategoryEntity Category { get; set; }
    public SellerEntity Seller { get; set; }
    public ICollection<ProductAttributeEntity> ProductAttributes { get; set; }
    public ICollection<InvoiceEntity> Invoices { get; set; }
    public ICollection<PreInvoiceEntity> PreInvoices { get; set; }
    public ICollection<ProductCommentEntity> Comments { get; set; }
}
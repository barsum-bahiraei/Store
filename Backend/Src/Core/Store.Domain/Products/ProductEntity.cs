using Store.Domain.Categories;
using Store.Domain.Invoices;
using Store.Domain.Sellers;

namespace Store.Domain.Products;

public class ProductEntity : BaseEntity
{
    public string Name { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public int SellerId { get; set; }
    public CategoryEntity Category { get; set; }
    public SellerEntity Seller { get; set; }
    public ICollection<ProductAttributeEntity> ProductAttributes { get; set; }
    public ICollection<InvoiceEntity> Invoices { get; set; }
    public ICollection<PreInvoiceEntity> PreInvoices { get; set; }
    public ICollection<ProductCommentEntity> ProductComments { get; set; }
    public ICollection<ProductBookmarkEntity> ProductBookmarks { get; set; }
}
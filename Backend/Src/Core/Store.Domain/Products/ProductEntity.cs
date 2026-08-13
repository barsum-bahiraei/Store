using Store.Domain.Categories;

namespace Store.Domain.Products;

public class ProductEntity : BaseEntity
{
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string MainImageUrl { get; set; }
    public CategoryEntity Category { get; set; }
    public ICollection<ProductAttributeEntity> ProductAttributes { get; set; }
}
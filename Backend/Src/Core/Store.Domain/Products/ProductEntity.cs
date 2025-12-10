using Store.Domain.Categories;

namespace Store.Domain.Products;

public class ProductEntity : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
    public int CategoryId { get; set; }
    public CategoryEntity Category { get; set; }
    public List<ProductCommentEntity> ProductComments { get; set; }
    public List<ProductAttributeEntity> ProductAttributes { get; set; }
}
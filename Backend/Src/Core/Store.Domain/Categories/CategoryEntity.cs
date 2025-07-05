using Store.Domain.Products;

namespace Store.Domain.Categories;

public class CategoryEntity : BaseEntity
{
    public string Name { get; set; }
    public int? ParentId { get; set; }

    public CategoryEntity? Parent { get; set; }
    public List<CategoryEntity>? Children { get; set; }
    public List<ProductEntity> Products { get; set; }
}
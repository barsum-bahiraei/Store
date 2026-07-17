using Store.Domain.Attribute;

namespace Store.Domain.Categories;

public class CategoryAttributeEntity
{
    public int CategoryId { get; set; }
    public CategoryEntity Category { get; set; }

    public int AttributeId { get; set; }
    public AttributeEntity Attribute { get; set; }
}
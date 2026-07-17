using Store.Domain.Categories;
using Store.Service.Attributes;
using Store.Service.Products;

namespace Store.Domain.Attribute;

public class AttributeEntity : BaseEntity
{
    public string Title { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
    public ICollection<CategoryAttributeEntity> CategoryAttributes { get; set; }
    public ICollection<ProductAttributeEntity> ProductAttributes { get; set; }
}
using Store.Domain.Attribute;

namespace Store.Domain.Products;

public class ProductAttributeEntity : BaseEntity
{
    public int ProductId { get; set; }
    public ProductEntity Product { get; set; }

    public int AttributeId { get; set; }
    public AttributeEntity Attribute { get; set; }

    public string Value { get; set; }
}
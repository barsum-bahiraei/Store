using Store.Domain.Attribute;
using Store.Service.Attributes;

namespace Store.Domain.Categories.Models.Output;

public class CategoryAttributeListOutput
{
    public int Id { get; set; }
    public int AttributeId { get; set; }
    public string? AttributeTitle { get; set; }
    public AttributeUnitEnum AttributeUnit { get; set; }
    public AttributeTypeEnum AttributeType { get; set; }
}
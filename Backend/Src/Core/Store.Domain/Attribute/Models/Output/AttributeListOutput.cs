using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Output;

public class AttributeListOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
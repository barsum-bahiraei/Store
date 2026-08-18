using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Input;

public class AttributeUpdateInput
{
    public string Name { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
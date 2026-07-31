using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Output;

public class AttributeUpdateOutput
{
    public string Title { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
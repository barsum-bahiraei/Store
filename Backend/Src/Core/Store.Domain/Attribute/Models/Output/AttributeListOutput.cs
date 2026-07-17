using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Output;

public class AttributeListOutput
{
    public string Title { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
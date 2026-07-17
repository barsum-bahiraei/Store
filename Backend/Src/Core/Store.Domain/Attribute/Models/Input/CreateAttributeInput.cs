using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Input;

public class CreateAttributeInput
{
    public string Title { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
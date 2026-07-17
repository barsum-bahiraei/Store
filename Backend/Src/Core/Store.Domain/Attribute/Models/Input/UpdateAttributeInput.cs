using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Input;

public class UpdateAttributeInput
{
    public string Title { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
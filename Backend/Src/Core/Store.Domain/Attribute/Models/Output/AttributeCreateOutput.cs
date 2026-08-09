using Store.Service.Attributes;

namespace Store.Domain.Attribute.Models.Output;

public class AttributeCreateOutput
{
    public int Id { get; set; }
    public string Title { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public AttributeTypeEnum Type { get; set; }
}
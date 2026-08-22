using Store.Domain.Attribute;
using Store.Domain.Files;
using Store.Service.Attributes;

namespace Store.Domain.Products.Models.Output;

public class ProductGetOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public List<ProductImageGetOutput>? Images { get; set; }
    public List<ProductAttributeGetOutput> Attributes { get; set; }
}

public class ProductAttributeGetOutput
{
    public int Id { get; set; }
    public int AttributeId { get; set; }
    public string? AttributeTitle { get; set; }
    public string Value { get; set; }
    public AttributeUnitEnum AttributeUnit { get; set; }
    public AttributeTypeEnum AttributeType { get; set; }
}

public class ProductImageGetOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}
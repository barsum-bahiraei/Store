namespace Store.Domain.Categories.Models.Output;

public class CategoryAttributeListOutput
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryTitle { get; set; }
    public int AttributeId { get; set; }
    public string? AttributeTitle { get; set; }
}
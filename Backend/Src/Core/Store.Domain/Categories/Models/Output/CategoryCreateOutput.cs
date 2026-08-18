namespace Store.Domain.Categories.Models.Output;

public class CategoryCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? ParentId { get; set; }
}
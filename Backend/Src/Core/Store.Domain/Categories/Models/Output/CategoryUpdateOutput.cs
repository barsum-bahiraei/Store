namespace Store.Domain.Categories.Models.Input;

public class CategoryUpdateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? ParentId { get; set; }
}
namespace Store.Domain.Categories.Models.Input;

public class CategoryUpdateInput
{
    public string Name { get; set; }
    public int? ParentId { get; set; }
}
namespace Store.Domain.Categories.Models.Input;

public class CategoryUpdateInput
{
    public string Title { get; set; }
    public int? ParentId { get; set; }
}
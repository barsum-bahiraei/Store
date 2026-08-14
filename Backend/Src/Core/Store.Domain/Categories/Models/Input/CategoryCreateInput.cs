namespace Store.Domain.Categories.Models.Input;

public class CategoryCreateInput
{
    public string Title { get; set; }
    public int? ParentId { get; set; }
}
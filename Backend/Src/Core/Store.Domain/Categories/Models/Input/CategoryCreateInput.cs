namespace Store.Domain.Categories.Models.Input;

public class CategoryCreateInput
{
    public string Name { get; set; }
    public int? ParentId { get; set; }
}
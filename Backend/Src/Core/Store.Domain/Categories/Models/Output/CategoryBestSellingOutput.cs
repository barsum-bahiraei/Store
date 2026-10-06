namespace Store.Domain.Categories.Models.Output;

public class CategoryBestSellingOutput
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public int? ParentId { get; set; }
}

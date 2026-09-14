namespace Store.Domain.Products.Models.Output;

public class ProductCommentCreateOutput
{
    public int Id { get; set; }
    public string Text { get; set; }
    public byte? Rating { get; set; }
    public bool? IsShow { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; }
}

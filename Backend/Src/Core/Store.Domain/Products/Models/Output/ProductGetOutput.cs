namespace Store.Domain.Products.Models.Output;

public class ProductGetOutput
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public string MainImageUrl { get; set; }
}
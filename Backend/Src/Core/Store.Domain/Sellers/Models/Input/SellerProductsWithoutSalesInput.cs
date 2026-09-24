namespace Store.Domain.Sellers.Models.Input;

public class SellerProductsWithoutSalesInput
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}

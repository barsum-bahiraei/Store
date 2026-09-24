namespace Store.Domain.Sellers.Models.Input;

public class SellerLowStockInput
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int Threshold { get; set; } = 5;
}

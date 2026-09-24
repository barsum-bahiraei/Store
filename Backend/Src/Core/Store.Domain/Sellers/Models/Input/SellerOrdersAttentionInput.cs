namespace Store.Domain.Sellers.Models.Input;

public class SellerOrdersAttentionInput
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int StuckDays { get; set; } = 3;
}

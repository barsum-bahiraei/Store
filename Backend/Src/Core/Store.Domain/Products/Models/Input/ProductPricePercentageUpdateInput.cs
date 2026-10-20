namespace Store.Domain.Products.Models.Input;

public class ProductPricePercentageUpdateInput : ProductListFilterInput
{
    public decimal Percentage { get; set; }
    public bool? IsIncrease { get; set; }
    public int ExpectedProductCount { get; set; }
}

namespace Store.Domain.Sellers.Models.Output;

public class SellerTopVariantsOutput
{
    public int TotalCount { get; set; }
    public List<SellerTopVariantItemOutput> Items { get; set; }
}

public class SellerTopVariantItemOutput
{
    public int ProductVariantId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public List<SellerTopVariantValueItemOutput> Values { get; set; }
    public int UnitsSold { get; set; }
    public decimal SalesAmount { get; set; }
}

public class SellerTopVariantValueItemOutput
{
    public int Id { get; set; }
    public string Size { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}

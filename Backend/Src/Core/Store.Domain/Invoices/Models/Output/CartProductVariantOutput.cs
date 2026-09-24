namespace Store.Domain.Invoices.Models.Output;

public class CartProductVariantOutput
{
    public int Id { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public List<CartVariantValueOutput> Values { get; set; }
}

public class CartVariantValueOutput
{
    public int Id { get; set; }
    public string Size { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}

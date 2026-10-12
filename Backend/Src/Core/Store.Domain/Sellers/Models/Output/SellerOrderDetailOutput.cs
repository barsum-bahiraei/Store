using Store.Domain.Invoices;

namespace Store.Domain.Sellers.Models.Output;

public class SellerOrderDetailOutput
{
    public int Id { get; set; }
    public decimal TotalPrice { get; set; }
    public int TotalCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public PaymentStatusEnum PaymentStatus { get; set; }
    public PaymentMethodEnum PaymentMethod { get; set; }
    public DeliveryMethodEnum DeliveryMethod { get; set; }
    public SellerOrderCustomerOutput Customer { get; set; }
    public List<SellerOrderItemOutput> Items { get; set; }
}

public class SellerOrderCustomerOutput
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class SellerOrderItemOutput
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string CategoryName { get; set; }
    public int ProductVariantId { get; set; }
    public int ProductCount { get; set; }
    public decimal ProductPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? ImageUrl { get; set; }
    public List<SellerOrderVariantValueOutput> Values { get; set; }
}

public class SellerOrderVariantValueOutput
{
    public int Id { get; set; }
    public string Size { get; set; }
    public string ColorName { get; set; }
    public string ColorCode { get; set; }
}

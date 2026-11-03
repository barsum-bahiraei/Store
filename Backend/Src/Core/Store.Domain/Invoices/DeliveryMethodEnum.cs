namespace Store.Domain.Invoices;

public enum DeliveryMethodEnum
{
    /// <summary>
    /// دریافت حضوری
    /// </summary>
    Pickup = 0,

    /// <summary>
    /// ارسال با تیپاکس
    /// </summary>
    Tipax = 2,

    /// <summary>
    /// ارسال با پست
    /// </summary>
    Post = 3
}

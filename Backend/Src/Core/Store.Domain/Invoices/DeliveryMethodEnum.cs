namespace Store.Domain.Invoices;

public enum DeliveryMethodEnum
{
    /// <summary>
    /// دریافت حضوری
    /// </summary>
    Pickup,

    /// <summary>
    /// ارسال با چاپار
    /// </summary>
    Chapar,

    /// <summary>
    /// ارسال با تیپاکس
    /// </summary>
    Tipax,

    /// <summary>
    /// ارسال با پست
    /// </summary>
    Post
}
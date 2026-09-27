namespace Store.Domain.Invoices;

public enum PaymentMethodEnum
{
    /// <summary>
    /// پرداخت نقدی
    /// </summary>
    Cash,

    /// <summary>
    /// پرداخت آنلاین
    /// </summary>
    Online,

    /// <summary>
    /// پرداخت با چک
    /// </summary>
    Check
}
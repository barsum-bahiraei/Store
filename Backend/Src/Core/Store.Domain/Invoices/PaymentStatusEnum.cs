namespace Store.Domain.Invoices;

public enum PaymentStatusEnum
{
    New,
    Processing,
    Completed,
    Failed,
    Cancelled
}
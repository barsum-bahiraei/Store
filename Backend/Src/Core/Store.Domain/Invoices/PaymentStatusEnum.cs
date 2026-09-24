namespace Store.Domain.Invoices;

public enum PaymentStatusEnum
{
    New,                    // سفارش ثبت شده
    ProcessingPayment,      // در حال پرداخت
    PaymentCompleted,       // پرداخت موفق
    Preparing,              // در حال آماده‌سازی
    ReadyForShipment,       // آماده ارسال
    Shipping,               // تحویل به پست/پیک و در حال ارسال
    Delivered,              // تحویل مشتری
    Cancelled,              // لغو شده
    Failed                  // خطا/ناموفق
}
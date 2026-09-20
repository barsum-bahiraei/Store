using Store.Domain.Accounts;

namespace Store.Domain.Invoices;

public interface IInvoiceRepository
{
    Task<List<CartEntity>> CartListAsync(int userId, CancellationToken cancellation);
    Task<CartEntity?> CartGetAsync(int id, int userId, CancellationToken cancellation);
    Task<CartEntity> CartCreateAsync(CartEntity input, CancellationToken cancellation);
    Task<CartEntity> CartUpdateAsync(CartEntity input, CancellationToken cancellation);
    Task CartDeleteAsync(CartEntity input, CancellationToken cancellation);
    Task<UserDiscountCodeEntity?> UserDiscountCodeGetAsync(int userId, string code,
        CancellationToken cancellation);
    Task<(InvoiceEntity Invoice, PaymentEntity Payment)> CheckoutCreateAsync(
        InvoiceEntity invoice, PaymentEntity payment, IReadOnlyCollection<CartEntity> carts,
        CancellationToken cancellation);

    Task<List<InvoiceEntity>> ListAsync(int userId, CancellationToken cancellation);
}

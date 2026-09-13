namespace Store.Domain.Invoices;

public interface IInvoiceRepository
{
    Task<List<PreInvoiceEntity>> PreInvoiceListAsync(int userId, CancellationToken cancellation);
    Task<PreInvoiceEntity?> PreInvoiceGetAsync(int userId, CancellationToken cancellation);
    Task<PreInvoiceEntity> PreInvoiceCreateAsync(PreInvoiceEntity input, CancellationToken cancellation);
    Task<PreInvoiceEntity> PreInvoiceUpdateAsync(PreInvoiceEntity input, CancellationToken cancellation);
    Task PreInvoiceDeleteAsync(PreInvoiceEntity input, CancellationToken cancellation);

    Task<List<InvoiceEntity>> ListAsync(int userId, CancellationToken cancellation);
}
using Microsoft.EntityFrameworkCore;
using Store.Domain.Invoices;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class InvoiceRepository(StoreDbContext context) : IInvoiceRepository
{
    public async Task<List<PreInvoiceEntity>> PreInvoiceListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.PreInvoices
            .Include(x => x.Product)
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<PreInvoiceEntity?> PreInvoiceGetAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.PreInvoices
            .Include(x => x.Product)
            .Where(x => x.UserId == userId)
            .FirstOrDefaultAsync(cancellation);
        return result;
    }

    public async Task<PreInvoiceEntity?> PreInvoiceGetAsync(int id, int userId, CancellationToken cancellation)
    {
        var result = await context.PreInvoices
            .Include(x => x.Product)
            .Where(x => x.Id == id && x.UserId == userId)
            .FirstOrDefaultAsync(cancellation);
        return result;
    }

    public async Task<PreInvoiceEntity> PreInvoiceCreateAsync(PreInvoiceEntity input, CancellationToken cancellation)
    {
        await context.PreInvoices.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        var result = await context.PreInvoices
            .Include(x => x.Product)
            .Where(x => x.Id == input.Id && x.UserId == input.UserId)
            .FirstAsync(cancellation);
        return result;
    }

    public async Task<PreInvoiceEntity> PreInvoiceUpdateAsync(PreInvoiceEntity input, CancellationToken cancellation)
    {
        context.PreInvoices.Update(input);
        await context.SaveChangesAsync(cancellation);
        var result = await context.PreInvoices
            .Include(x => x.Product)
            .Where(x => x.Id == input.Id && x.UserId == input.UserId)
            .FirstAsync(cancellation);
        return result;
    }

    public async Task PreInvoiceDeleteAsync(PreInvoiceEntity input, CancellationToken cancellation)
    {
        context.PreInvoices.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task<List<InvoiceEntity>> ListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.Invoices.Where(x => x.UserId == userId).ToListAsync(cancellation);
        return result;
    }
}

using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Domain.Invoices;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class InvoiceRepository(StoreDbContext context) : IInvoiceRepository
{
    public async Task<List<CartEntity>> CartListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.Carts
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .ThenInclude(x => x.AttributeValues)
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<CartEntity?> CartGetAsync(int id, int userId, CancellationToken cancellation)
    {
        var result = await context.Carts
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .ThenInclude(x => x.AttributeValues)
            .Where(x => x.Id == id && x.UserId == userId)
            .FirstOrDefaultAsync(cancellation);
        return result;
    }

    public async Task<CartEntity?> CartAddAsync(CartEntity input, CancellationToken cancellation)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellation);
        var lockKey = $"cart:{input.UserId}:{input.ProductVariantId}";
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtextextended({lockKey}, 0))",
            cancellation);

        var variant = await context.ProductVariants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == input.ProductVariantId && x.ProductId == input.ProductId,
                cancellation);
        if (variant == null)
            return null;

        var existing = await context.Carts.FirstOrDefaultAsync(
            x => x.UserId == input.UserId &&
                 x.ProductId == input.ProductId &&
                 x.ProductVariantId == input.ProductVariantId,
            cancellation);
        var requestedCount = input.ProductCount + (existing?.ProductCount ?? 0);
        if (variant.Stock < requestedCount)
            return null;

        if (existing == null)
            await context.Carts.AddAsync(input, cancellation);
        else
            existing.ProductCount = requestedCount;

        await context.SaveChangesAsync(cancellation);
        await transaction.CommitAsync(cancellation);
        var cartId = existing?.Id ?? input.Id;
        return await CartGetAsync(cartId, input.UserId, cancellation);
    }

    public async Task<CartEntity> CartUpdateAsync(CartEntity input, CancellationToken cancellation)
    {
        context.Carts.Update(input);
        await context.SaveChangesAsync(cancellation);
        var result = await context.Carts
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .ThenInclude(x => x.AttributeValues)
            .Where(x => x.Id == input.Id && x.UserId == input.UserId)
            .FirstAsync(cancellation);
        return result;
    }

    public async Task CartDeleteAsync(CartEntity input, CancellationToken cancellation)
    {
        context.Carts.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task<UserDiscountCodeEntity?> UserDiscountCodeGetAsync(int userId, string code,
        CancellationToken cancellation)
    {
        return await context.UserDiscountCodes
            .AsNoTracking()
            .Include(x => x.DiscountCode)
            .FirstOrDefaultAsync(x => x.UserId == userId && x.DiscountCode.Code == code, cancellation);
    }

    public async Task<(InvoiceEntity Invoice, PaymentEntity Payment)> CheckoutCreateAsync(
        InvoiceEntity invoice, PaymentEntity payment, IReadOnlyCollection<CartEntity> carts,
        CancellationToken cancellation)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellation);

        invoice.Payments = [payment];
        await context.Invoices.AddAsync(invoice, cancellation);
        context.Carts.RemoveRange(carts);
        await context.SaveChangesAsync(cancellation);

        // TODO: Mark UserDiscountCode as used only after a future payment verification succeeds.
        await transaction.CommitAsync(cancellation);
        return (invoice, payment);
    }

    public async Task<List<InvoiceEntity>> ListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.Invoices
            .Include(x => x.User)
            .Include(x => x.InvoiceItems)
            .Include(x => x.Payments)
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<List<InvoiceEntity>> SellerListAsync(int userId, DateTime? from, DateTime? to,
        CancellationToken cancellation)
    {
        var query = context.Invoices
            .Include(x => x.User)
            .Include(x => x.InvoiceItems)
            .ThenInclude(x => x.Product)
            .ThenInclude(x => x.Category)
            .Include(x => x.InvoiceItems)
            .ThenInclude(x => x.ProductVariant)
            .ThenInclude(x => x.AttributeValues)
            .Include(x => x.Payments)
            .Include(x => x.DiscountCode)
            .Where(x => x.InvoiceItems.Any(item => item.Product.Seller.UserId == userId))
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(x => x.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.CreatedAt <= to.Value);

        var result = await query
            .OrderBy(x => x.Id)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<InvoiceEntity?> SellerGetAsync(int id, int userId, CancellationToken cancellation)
    {
        var result = await context.Invoices
            .Include(x => x.User)
            .Include(x => x.InvoiceItems)
            .ThenInclude(x => x.Product)
            .ThenInclude(x => x.Category)
            .Include(x => x.InvoiceItems)
            .ThenInclude(x => x.ProductVariant)
            .ThenInclude(x => x.AttributeValues)
            .Include(x => x.Payments)
            .Include(x => x.DiscountCode)
            .FirstOrDefaultAsync(x => x.Id == id &&
                                      x.InvoiceItems.Any(item => item.Product.Seller.UserId == userId),
                cancellation);
        return result;
    }

    public async Task<InvoiceEntity> UpdateAsync(InvoiceEntity input, CancellationToken cancellation)
    {
        context.Invoices.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }
}

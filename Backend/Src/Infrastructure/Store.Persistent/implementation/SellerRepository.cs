using Microsoft.EntityFrameworkCore;
using Store.Domain.Sellers;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class SellerRepository(StoreDbContext context) : ISellerRepository
{
    public async Task<List<SellerEntity>> ListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.Sellers.Where(x => x.UserId == userId).ToListAsync(cancellation);
        return result;
    }

    public async Task<SellerEntity?> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Sellers.FirstOrDefaultAsync(c => c.Id == id, cancellation);
        return result;
    }

    public async Task<SellerEntity> CreateAsync(SellerEntity input, CancellationToken cancellation)
    {
        await context.Sellers.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<SellerEntity> UpdateAsync(SellerEntity input, CancellationToken cancellation)
    {
        context.Sellers.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task DeleteAsync(SellerEntity input, CancellationToken cancellation)
    {
        context.Sellers.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }
}
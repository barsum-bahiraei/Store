using Microsoft.EntityFrameworkCore;
using Store.Domain.Products;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class ProductRepository(StoreDbContext context) : IProductRepository
{
    public async Task<List<ProductEntity>> ListAsync(CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Category)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<ProductEntity?> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Category)
            .Include(x => x.ProductAttributes)
            .ThenInclude(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation)
    {
        await context.Products.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation)
    {
        context.Products.Update(input);
        await context.SaveChangesAsync(cancellation);
        var entity = await context.Products
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == input.Id, cancellation);
        return entity;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        context.Products.Remove(entity);
        await context.SaveChangesAsync(cancellation);
    }
}
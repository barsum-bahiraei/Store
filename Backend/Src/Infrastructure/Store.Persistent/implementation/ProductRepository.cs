using Microsoft.EntityFrameworkCore;
using Store.Persistent.Database.Sql;
using Store.Service.Products;

namespace Store.Persistent.implementation;

public class ProductRepository(StoreDbContext context) : IProductRepository
{
    public async Task<List<ProductEntity>> ListAsync(CancellationToken cancellation)
    {
        var result = await context.Products.ToListAsync(cancellation);
        return result;
    }

    public async Task<ProductEntity> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellation);
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
        var entity = await context.Products.FirstOrDefaultAsync(x => x.Id == input.Id, cancellation);
        entity.Title = input.Title;
        entity.Description = input.Description;
        entity.Price = input.Price;
        entity.Discount = input.Discount;
        await context.SaveChangesAsync(cancellation);
        return entity;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        context.Products.Remove(entity);
        await context.SaveChangesAsync(cancellation);
    }
}
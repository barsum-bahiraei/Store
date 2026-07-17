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

    public async Task<ProductEntity> CreateAsync(ProductEntity parameters, CancellationToken cancellation)
    {
        await context.Products.AddAsync(parameters, cancellation);
        await context.SaveChangesAsync(cancellation);
        return parameters;
    }

    public async Task<ProductEntity> UpdateAsync(ProductEntity parameters, CancellationToken cancellation)
    {
        var entity = await context.Products.FirstOrDefaultAsync(x => x.Id == parameters.Id, cancellation);
        entity.Title = parameters.Title;
        entity.Description = parameters.Description;
        entity.Price = parameters.Price;
        entity.Discount = parameters.Discount;
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
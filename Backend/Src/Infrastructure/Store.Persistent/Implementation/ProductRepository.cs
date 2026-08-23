using Microsoft.EntityFrameworkCore;
using Store.Domain.Products;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class ProductRepository(StoreDbContext context) : IProductRepository
{
    public async Task<List<ProductEntity>> ListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.Products
            .Where(x => x.Seller.UserId == userId)
            .Include(x => x.Category)
            .Include(x => x.Seller)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<ProductEntity?> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Seller)
            .Include(x => x.Category)
            .Include(x => x.ProductAttributes)
            .ThenInclude(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.Id == id && x.Seller.UserId == userId, cancellation);
        return result;
    }
    
    public async Task<ProductEntity?> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Seller)
            .Include(x => x.Category)
            .Include(x => x.ProductAttributes)
            .ThenInclude(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.Id == id , cancellation);
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

    public async Task DeleteAsync(ProductEntity input, CancellationToken cancellation)
    {
        context.Products.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }
}
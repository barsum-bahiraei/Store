using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Microsoft.EntityFrameworkCore;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class ProductRepository(AppDbContext context) : IProductRepository
{
    public Task<List<ProductEntity>> ListAsync(ProductListInput input, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DetailAsync(int productId, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation)
    {
        await context.Products.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int productId, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}
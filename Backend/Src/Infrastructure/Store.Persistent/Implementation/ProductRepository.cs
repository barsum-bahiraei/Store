using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Microsoft.EntityFrameworkCore;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;
public class ProductRepository(AppDbContext context) : IProductRepository
{
    public async Task DetailAsync(int id, CancellationToken cancellation)
    {
        await context.Products.FindAsync(id, cancellation);
    }

    public async Task<List<ProductListOutput>> ListAsync(ProductListInput parameters, CancellationToken cancellation)
    {
        var products = await context.Products
            .OrderBy(x => x.Id)
            .Select(x => new ProductListOutput
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                Description = x.Description,
                CreatedDate = x.CreatedDate,
                UpdatedDate = x.UpdatedDate,
            })
            .ToListAsync(cancellation);
        return products;
    }

    public Task CreateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }


}

using Domain.Products;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistent.Implementation;
internal class ProductRepository(DbContext context) : IProductRepository
{
    public async Task DetailAsync(int id, CancellationToken cancellation)
    {
        await context.Products.FindAsync(id, cancellation);
    }

    public async Task ListAsync(CancellationToken cancellation)
    {
        await context.Products.OrderBy(x => x.Id).ToListAsync(cancellation);
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

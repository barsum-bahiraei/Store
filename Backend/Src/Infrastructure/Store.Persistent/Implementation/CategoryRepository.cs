using Store.Domain.Categories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class CategoryRepository(AppDbContext context) : ICategoryRepository
{
    public Task<List<CategoryEntity>> ListAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<CategoryEntity> CreateAsync(CategoryEntity input, CancellationToken cancellation)
    {
        await context.Categories.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }
}
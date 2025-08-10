using Microsoft.EntityFrameworkCore;
using Store.Domain.Categories;
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.Implementation;

public class CategoryRepository(AppDbContext context) : ICategoryRepository
{
    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<List<CategoryListOutput>> ListAsync(CategoryListInput input, CancellationToken cancellation)
    {
        var categories = await context.Categories
            .OrderBy(x => x.Id)
            .Select(x => new CategoryListOutput
            {
                Name = x.Name
            })
            .ToListAsync(cancellation);
        return categories;
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
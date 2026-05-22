using Microsoft.EntityFrameworkCore;
using Store.Domain.Categories;
using Store.Persistent.Database.Sql;
using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Persistent.implementation;

public class CategoryRepository(StoreDbContext context) : ICategoryRepository
{
    public async Task<List<CategoryEntity>> List(CancellationToken cancellation)
    {
        var result = await context.Categoryies.ToListAsync(cancellation);
        return result;
    }
}

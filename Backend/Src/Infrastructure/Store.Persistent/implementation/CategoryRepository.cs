using Microsoft.EntityFrameworkCore;
using Store.Domain.Categories;
using Store.Persistent.Database.Sql;
using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Persistent.implementation;

public class CategoryRepository(StoreDbContext context) : ICategoryRepository
{
    public async Task<List<CategoryEntity>> ListAsync(CancellationToken cancellation)
    {
        var result = await context.Categoryies.ToListAsync(cancellation);
        return result;
    }

    public async Task<CategoryEntity> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Categoryies.FirstOrDefaultAsync(c => c.Id == id, cancellation);
        return result;
    }

    public async Task<CategoryEntity> CreateAsync(CategoryEntity input, CancellationToken cancellation)
    {
        await context.Categoryies.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<CategoryEntity> UpdateAsync(CategoryEntity input, CancellationToken cancellation)
    {
        var entity = await context.Categoryies.FirstOrDefaultAsync(x => x.Id == input.Id, cancellation);
        entity.Title = input.Title;
        await context.SaveChangesAsync(cancellation);
        return entity;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await context.Categoryies.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        context.Categoryies.Remove(entity);
        await context.SaveChangesAsync(cancellation);
    }
}
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

    public async Task<CategoryEntity?> GetAsync(int id, CancellationToken cancellation)
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

    public async Task<List<CategoryAttributeEntity>> AttributeListAsync(int categoryId, CancellationToken cancellation)
    {
        var result = await context.CategoryAttributes
            .Where(x => x.CategoryId == categoryId)
            .Include(x => x.Category)
            .Include(x => x.Attribute)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<CategoryAttributeEntity?> AttributeGetAsync(int categoryId, int attributeId,
        CancellationToken cancellation)
    {
        var result = await context.CategoryAttributes
            .Include(x => x.Category)
            .Include(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.CategoryId == categoryId && x.AttributeId == attributeId, cancellation);
        return result;
    }

    public async Task<CategoryAttributeEntity> AttributeAddAsync(CategoryAttributeEntity input,
        CancellationToken cancellation)
    {
        await context.CategoryAttributes.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        var result = await context.CategoryAttributes
            .Include(x => x.Category)
            .Include(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.Id == input.Id, cancellation);
        return result;
    }

    public async Task AttributeDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await context.CategoryAttributes.FirstOrDefaultAsync(c => c.Id == id, cancellation);
        context.CategoryAttributes.Remove(entity);
        await context.SaveChangesAsync(cancellation);
    }
}
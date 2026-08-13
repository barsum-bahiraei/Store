using Microsoft.EntityFrameworkCore;
using Store.Domain.Attribute;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class AttributeRepository(StoreDbContext context) : IAttributeRepository
{
    public async Task<List<AttributeEntity>> ListAsync(CancellationToken cancellation)
    {
        var result = await context.Attributes.ToListAsync(cancellation);
        return result;
    }

    public async Task<AttributeEntity?> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Attributes.FirstAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<AttributeEntity> CreateAsync(AttributeEntity entity, CancellationToken cancellation)
    {
        await context.AddAsync(entity, cancellation);
        await context.SaveChangesAsync(cancellation);
        return entity;
    }

    public async Task<AttributeEntity> UpdateAsync(AttributeEntity input, CancellationToken cancellation)
    {
        var entity = await context.Attributes.FirstOrDefaultAsync(x => x.Id == input.Id, cancellation);
        entity.Title = input.Title;
        entity.Unit = input.Unit;
        entity.Type = input.Type;
        await context.SaveChangesAsync(cancellation);
        return entity;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await context.Attributes.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        context.Attributes.Remove(entity);
        await context.SaveChangesAsync(cancellation);
    }
}
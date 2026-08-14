using Microsoft.EntityFrameworkCore;
using Store.Domain.Files;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class FileRepository(StoreDbContext context) : IFileRepository
{
    public async Task<List<FileEntity>> ListAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId,
        CancellationToken cancellationToken)
    {
        var result = await context.Files
            .Where(x => x.TableName == tableName && x.TargetId == targetId && x.TargetName == targetName)
            .ToListAsync(cancellationToken);
        return result;
    }

    public async Task<FileEntity?> GetAsync(int id, CancellationToken cancellationToken)
    {
        var result = await context.Files
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return result;
    }

    public async Task<FileEntity> CreateAsync(FileEntity input, CancellationToken cancellationToken)
    {
        var entity = await context.Files.AddAsync(input, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return entity.Entity;
    }

    public async Task<FileEntity> UpdateAsync(FileEntity input, CancellationToken cancellationToken)
    {
        context.Files.Update(input);
        await context.SaveChangesAsync(cancellationToken);
        return input;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await context.Files
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        context.Files.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
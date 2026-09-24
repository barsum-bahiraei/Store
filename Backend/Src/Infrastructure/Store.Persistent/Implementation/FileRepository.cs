using Microsoft.EntityFrameworkCore;
using Store.Domain.Files;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class FileRepository(StoreDbContext context) : IFileRepository
{
    public async Task<List<FileEntity>> ListAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId, CancellationToken cancellationToken)
    {
        return await context.Files
            .Where(x => x.TableName == tableName && x.TargetId == targetId && x.TargetName == targetName)
            .ToListAsync(cancellationToken);
    }

    public async Task<FileEntity?> GetAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId, CancellationToken cancellationToken)
    {
        return await context.Files
            .FirstOrDefaultAsync(x =>
                x.TableName == tableName &&
                x.TargetId == targetId &&
                x.TargetName == targetName &&
                x.IsMain, cancellationToken);
    }

    public async Task<FileEntity?> GetAsync(int id, CancellationToken cancellationToken)
    {
        return await context.Files
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
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

    public async Task DeleteAsync(FileEntity entity, CancellationToken cancellationToken)
    {
        context.Files.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int?> GetOwnerUserIdAsync(TableNameEnum tableName, int targetId, CancellationToken cancellationToken)
    {
        return tableName switch
        {
            TableNameEnum.Products => await context.Products
                .Where(x => x.Id == targetId)
                .Select(x => (int?)x.Seller.UserId)
                .FirstOrDefaultAsync(cancellationToken),
            TableNameEnum.Sellers => await context.Sellers
                .Where(x => x.Id == targetId)
                .Select(x => (int?)x.UserId)
                .FirstOrDefaultAsync(cancellationToken),
            _ => null
        };
    }
}
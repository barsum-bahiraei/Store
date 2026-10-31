using Microsoft.EntityFrameworkCore;
using Store.Domain.Files;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class FileRepository(StoreDbContext context) : IFileRepository
{
    public async Task<List<FileEntity>> ListAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId, CancellationToken cancellationToken)
    {
        var query = context.Files
            .Where(x => x.TableName == tableName && x.TargetId == targetId && x.TargetName == targetName);

        return tableName == TableNameEnum.Products && targetName == TargetNameEnum.ProductId
            ? await query
                .OrderBy(x => x.DisplayOrder ?? int.MaxValue)
                .ThenBy(x => x.Id)
                .ToListAsync(cancellationToken)
            : await query
                .OrderByDescending(x => x.Id)
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

    public async Task<List<FileEntity>> MainListAsync(TableNameEnum tableName, TargetNameEnum targetName,
        IReadOnlyCollection<int> targetIds, CancellationToken cancellationToken)
    {
        var query = context.Files
            .AsNoTracking()
            .Where(x => x.TableName == tableName &&
                        x.TargetName == targetName &&
                        targetIds.Contains(x.TargetId) &&
                        x.IsMain);

        return tableName == TableNameEnum.Products && targetName == TargetNameEnum.ProductId
            ? await query
                .OrderBy(x => x.DisplayOrder ?? int.MaxValue)
                .ThenBy(x => x.Id)
                .ToListAsync(cancellationToken)
            : await query
                .OrderByDescending(x => x.Id)
                .ToListAsync(cancellationToken);
    }

    public async Task<FileEntity?> GetAsync(int id, CancellationToken cancellationToken)
    {
        return await context.Files
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<FileEntity>> ListByIdsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
            return [];

        return await context.Files
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);
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

    public async Task UpdateDisplayOrdersAsync(IReadOnlyDictionary<int, int> displayOrders,
        CancellationToken cancellationToken)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        var updatedAt = DateTime.UtcNow;

        foreach (var item in displayOrders)
        {
            var updated = await context.Files
                .Where(x => x.Id == item.Key)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.DisplayOrder, item.Value)
                    .SetProperty(x => x.UpdatedAt, updatedAt), cancellationToken);

            if (updated != 1)
                throw new InvalidOperationException("File order update failed.");
        }

        await transaction.CommitAsync(cancellationToken);
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

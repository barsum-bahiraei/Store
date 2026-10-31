namespace Store.Domain.Files;

public interface IFileRepository
{
    Task<List<FileEntity>> ListAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId, CancellationToken cancellationToken);
    Task<FileEntity?> GetAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId, CancellationToken cancellationToken);
    Task<List<FileEntity>> MainListAsync(TableNameEnum tableName, TargetNameEnum targetName,
        IReadOnlyCollection<int> targetIds, CancellationToken cancellationToken);
    Task<FileEntity?> GetAsync(int id, CancellationToken cancellationToken);
    Task<List<FileEntity>> ListByIdsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken);
    Task<FileEntity> CreateAsync(FileEntity input, CancellationToken cancellationToken);
    Task<FileEntity> UpdateAsync(FileEntity input, CancellationToken cancellationToken);
    Task UpdateDisplayOrdersAsync(IReadOnlyDictionary<int, int> displayOrders, CancellationToken cancellationToken);
    Task DeleteAsync(FileEntity entity, CancellationToken cancellationToken);
    Task<int?> GetOwnerUserIdAsync(TableNameEnum tableName, int targetId, CancellationToken cancellationToken);
}

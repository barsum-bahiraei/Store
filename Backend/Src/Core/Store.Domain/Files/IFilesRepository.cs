namespace Store.Domain.Files;

public interface IFilesRepository
{
    Task<List<FileEntity>> ListAsync(TableNameEnum tableName, TargetNameEnum targetName, int targetId,
        CancellationToken cancellationToken);
    Task<FileEntity?> GetAsync(int id, CancellationToken cancellationToken);
    Task<FileEntity> CreateAsync(FileEntity input, CancellationToken cancellationToken);
    Task<FileEntity> UpdateAsync(FileEntity input, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}
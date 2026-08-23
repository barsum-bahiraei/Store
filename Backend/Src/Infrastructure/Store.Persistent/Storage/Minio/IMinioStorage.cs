namespace Store.Persistent.Storage.Minio;

public interface IMinioStorage
{
    Task UploadAsync(Stream stream, long size, string contentType, string objectName, CancellationToken cancellation);
    Task UpdateAsync(Stream stream, long size, string contentType, string objectName, CancellationToken cancellation);
    Task DeleteAsync(string objectName, CancellationToken cancellation);
    Task<string> GetUrlAsync(string objectName, CancellationToken cancellation);
    Task<List<string>> GetListAsync(string prefix, CancellationToken cancellation);
}
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;

namespace Store.Persistent.Storage.Minio;

public class MinioStorage(IMinioClient minioClient, IConfiguration configuration) : IMinioStorage
{
    private readonly string _bucketName = configuration["Minio:Bucket"]!;

    public async Task UploadAsync(Stream stream, long size, string contentType, string objectName, CancellationToken cancellation)
    {
        await EnsureBucketAsync(cancellation);

        await minioClient.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(size)
                .WithContentType(contentType),
            cancellation);
    }

    public async Task UpdateAsync(Stream stream, long size, string contentType, string objectName, CancellationToken cancellation)
    {
        await UploadAsync(stream, size, contentType, objectName, cancellation);
    }

    public async Task DeleteAsync(string objectName, CancellationToken cancellation)
    {
        await minioClient.RemoveObjectAsync(
            new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName),
            cancellation);
    }

    public async Task<string> GetUrlAsync(string objectName, CancellationToken cancellation)
    {
        return await minioClient.PresignedGetObjectAsync(
            new PresignedGetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithExpiry(60 * 60));
    }

    public async Task<List<string>> GetListAsync(string prefix, CancellationToken cancellation)
    {
        var result = new List<string>();

        var args = new ListObjectsArgs()
            .WithBucket(_bucketName)
            .WithPrefix(prefix)
            .WithRecursive(true);

        await foreach (var item in minioClient.ListObjectsEnumAsync(args, cancellation))
            result.Add(item.Key);

        return result;
    }

    private async Task EnsureBucketAsync(CancellationToken cancellation)
    {
        var exists = await minioClient.BucketExistsAsync(
            new BucketExistsArgs()
                .WithBucket(_bucketName),
            cancellation);

        if (!exists)
        {
            await minioClient.MakeBucketAsync(
                new MakeBucketArgs()
                    .WithBucket(_bucketName),
                cancellation);
        }
    }
}
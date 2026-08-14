using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using Store.Domain.Files;
using Store.Domain.Files.Models.Input;
using Store.Domain.Files.Models.Output;

namespace Store.Service.Files;

public class FileService(IFileRepository fileRepository, IMinioClient minioClient, IConfiguration configuration)
{
    public async Task<Result<FileCreateOutput>> CreateAsync(FileCreateInput input, IFormFile file,
        CancellationToken cancellation)
    {
        var bucketName = configuration["Minio:Bucket"];
        var bucketExists =
            await minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName), cancellation);
        if (!bucketExists)
        {
            await minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(bucketName), cancellation);
        }

        var folder = input.TableName.ToString().Trim("/");
        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{input.Title}{extension}";
        var objectName = $"{folder}/{fileName}";

        await using var stream = file.OpenReadStream();
        await minioClient.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(file.Length)
                .WithContentType(file.ContentType),
            cancellation);


        var entity = new FileEntity
        {
            Title = input.Title,
            Url = objectName,
            FileType = input.FileType,
            TableName = input.TableName,
            TargetId = input.TargetId,
            TargetName = input.TargetName,
            IsMain = input.IsMain,
        };

        var created = await fileRepository.CreateAsync(entity, cancellation);
        var result = new FileCreateOutput
        {
            Id = created.Id,
            Title = created.Title,
            Url = created.Url,
            FileType = created.FileType,
            TableName = created.TableName,
            TargetId = created.TargetId,
            TargetName = created.TargetName,
            IsMain = created.IsMain,
        };
        return Result<FileCreateOutput>.Success(result);
    }

    public async Task<string> GetUrlAsync(string objectName, CancellationToken cancellation)
    {
        var bucketName = configuration["Minio:Bucket"]!;

        var args = new PresignedGetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithExpiry(60 * 60);

        return await minioClient.PresignedGetObjectAsync(args);
    }

    public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellation)
    {
        await fileRepository.DeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
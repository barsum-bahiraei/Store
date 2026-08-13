using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using Store.Domain.Files;
using Store.Domain.Files.Models.Input;
using Store.Domain.Files.Models.Output;

namespace Store.Service.Files;

public class FileService(IFilesRepository filesRepository, IMinioClient minioClient, IConfiguration configuration)
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
        var fileName = $"{input.Name}{extension}";
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
            Name = input.Name,
            Url = objectName,
            FileType = input.FileType,
            TableName = input.TableName,
            TargetId = input.TargetId,
            TargetName = input.TargetName,
            IsMain = input.IsMain,
        };

        var created = await filesRepository.CreateAsync(entity, cancellation);
        var result = new FileCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Url = created.Url,
            FileType = created.FileType,
            TableName = created.TableName,
            TargetId = created.TargetId,
            TargetName = created.TargetName,
            IsMain = created.IsMain,
        };
        return Result<FileCreateOutput>.Success(result);
    }
    
}
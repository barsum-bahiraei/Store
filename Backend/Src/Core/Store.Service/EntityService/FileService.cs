using Microsoft.AspNetCore.Http;
using Store.Domain.Files;
using Store.Domain.Files.Models.Input;
using Store.Domain.Files.Models.Output;
using Store.Persistent.Storage.Minio;

namespace Store.Service.EntityService;

public class FileService(IFileRepository fileRepository, IMinioStorage minioStorage)
{
    public async Task<Result<FileCreateOutput>> CreateAsync(
        FileCreateInput input,
        IFormFile file,
        CancellationToken cancellation)
    {
        var folder = input.TableName.ToString().Trim('/');
        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{input.Name}{extension}";
        var objectName = $"{folder}/{fileName}";

        await using var stream = file.OpenReadStream();

        await minioStorage.UploadAsync(
            stream,
            file.Length,
            file.ContentType,
            objectName,
            cancellation);

        var entity = new FileEntity
        {
            Name = input.Name,
            Url = objectName,
            FileType = input.FileType,
            TableName = input.TableName,
            TargetId = input.TargetId,
            TargetName = input.TargetName,
            IsMain = input.IsMain
        };

        var created = await fileRepository.CreateAsync(entity, cancellation);

        return Result<FileCreateOutput>.Success(new FileCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Url = await minioStorage.GetUrlAsync(created.Url, cancellation),
            FileType = created.FileType,
            TableName = created.TableName,
            TargetId = created.TargetId,
            TargetName = created.TargetName,
            IsMain = created.IsMain
        });
    }

    public async Task<Result<FileGetOutput>> GetAsync(
        int id,
        CancellationToken cancellation)
    {
        var entity = await fileRepository.GetAsync(id, cancellation);

        if (entity == null)
            return Result<FileGetOutput>.Failure("File not found");

        return Result<FileGetOutput>.Success(new FileGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Url = await minioStorage.GetUrlAsync(entity.Url, cancellation),
            FileType = entity.FileType,
            TableName = entity.TableName,
            TargetId = entity.TargetId,
            TargetName = entity.TargetName,
            IsMain = entity.IsMain
        });
    }

    public async Task<Result<FileGetOutput>> GetAsync(
        TableNameEnum tableName,
        TargetNameEnum targetName,
        int targetId,
        CancellationToken cancellation)
    {
        var entity = await fileRepository.GetAsync(
            tableName,
            targetName,
            targetId,
            cancellation);

        if (entity == null)
            return Result<FileGetOutput>.Failure("File not found");

        return Result<FileGetOutput>.Success(new FileGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Url = await minioStorage.GetUrlAsync(entity.Url, cancellation),
            FileType = entity.FileType,
            TableName = entity.TableName,
            TargetId = entity.TargetId,
            TargetName = entity.TargetName,
            IsMain = entity.IsMain
        });
    }

    public async Task<Result<List<FileListOutput>>> ListAsync(
        TableNameEnum tableName,
        TargetNameEnum targetName,
        int targetId,
        CancellationToken cancellation)
    {
        var entities = await fileRepository.ListAsync(
            tableName,
            targetName,
            targetId,
            cancellation);

        var result = new List<FileListOutput>();

        foreach (var entity in entities)
        {
            result.Add(new FileListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Url = await minioStorage.GetUrlAsync(entity.Url, cancellation),
                FileType = entity.FileType,
                TableName = entity.TableName,
                TargetId = entity.TargetId,
                TargetName = entity.TargetName,
                IsMain = entity.IsMain
            });
        }

        return Result<List<FileListOutput>>.Success(result);
    }

    public async Task<Result<FileUpdateOutput>> UpdateAsync(
        int id,
        FileUpdateInput input,
        IFormFile file,
        CancellationToken cancellation)
    {
        var entity = await fileRepository.GetAsync(id, cancellation);

        if (entity == null)
            return Result<FileUpdateOutput>.Failure("File not found");

        var folder = input.TableName.ToString().Trim('/');
        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{input.Name}{extension}";
        var objectName = $"{folder}/{fileName}";

        await using var stream = file.OpenReadStream();

        await minioStorage.UpdateAsync(
            stream,
            file.Length,
            file.ContentType,
            objectName,
            cancellation);

        if (entity.Url != objectName)
            await minioStorage.DeleteAsync(entity.Url, cancellation);

        entity.Name = input.Name;
        entity.Url = objectName;
        entity.FileType = input.FileType;
        entity.TableName = input.TableName;
        entity.TargetId = input.TargetId;
        entity.TargetName = input.TargetName;
        entity.IsMain = input.IsMain;

        var updated = await fileRepository.UpdateAsync(entity, cancellation);

        return Result<FileUpdateOutput>.Success(new FileUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            Url = await minioStorage.GetUrlAsync(updated.Url, cancellation),
            FileType = updated.FileType,
            TableName = updated.TableName,
            TargetId = updated.TargetId,
            TargetName = updated.TargetName,
            IsMain = updated.IsMain
        });
    }

    public async Task<Result<bool>> DeleteAsync(
        int id,
        CancellationToken cancellation)
    {
        var entity = await fileRepository.GetAsync(id, cancellation);

        if (entity == null)
            return Result<bool>.Failure("File not found");

        await minioStorage.DeleteAsync(entity.Url, cancellation);
        await fileRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }
}
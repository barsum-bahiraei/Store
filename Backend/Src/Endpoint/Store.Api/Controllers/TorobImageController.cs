using Microsoft.AspNetCore.Mvc;
using Minio.Exceptions;
using Store.Domain.Files;
using Store.Persistent.Storage.Minio;

namespace Store.Api.Controllers;

[ApiController]
public class TorobImageController(IFileRepository fileRepository, IMinioStorage minioStorage) : ControllerBase
{
    [HttpGet("/torob_api/v3/images/{id:int:min(1)}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellation = default)
    {
        var file = await fileRepository.GetAsync(id, cancellation);
        if (file is not { TableName: TableNameEnum.Products, TargetName: TargetNameEnum.ProductId,
                FileType: FileTypeEnum.Image })
            return NotFound();

        try
        {
            // The URL stays stable; MinIO credentials and expiring signatures stay on the server.
            await minioStorage.ReadAsync(file.Url, async (stream, contentType, size, token) =>
            {
                if (!contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    Response.StatusCode = StatusCodes.Status404NotFound;
                    return;
                }

                Response.ContentType = contentType;
                Response.ContentLength = size;
                Response.Headers.CacheControl = "public,max-age=3600";
                Response.Headers.XContentTypeOptions = "nosniff";
                await stream.CopyToAsync(Response.Body, token);
            }, cancellation);
            return new EmptyResult();
        }
        catch (ObjectNotFoundException) when (!Response.HasStarted)
        {
            return NotFound();
        }
    }
}

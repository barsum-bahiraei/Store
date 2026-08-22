using Store.Domain.Files;
using Store.Domain.Sellers;
using Store.Domain.Sellers.Models.Input;
using Store.Domain.Sellers.Models.Output;

namespace Store.Service.ProviderService;

public class SellerService(ISellerRepository sellerRepository, IFileRepository fileRepository, FileService fileService)
{
    public async Task<Result<List<SellerListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await sellerRepository.ListAsync(userId, cancellation);
        var result = new List<SellerListOutput>();
        foreach (var entity in entities)
        {
            var imageEntity = await fileRepository
                .GetAsync(TableNameEnum.Sellers, TargetNameEnum.SellerId, entity.Id, cancellation);
            var imageUrl = await fileService.GetUrlAsync(imageEntity.Url, cancellation);
            var image = new SellerImageListOutput
            {
                Id = imageEntity.Id,
                Name = imageEntity.Name,
                Url = imageUrl,
                IsMain = imageEntity.IsMain,
                FileType = imageEntity.FileType,
            };
            result.Add(new SellerListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity?.Description,
                Status = entity.Status,
                Image = image
            });
        }

        return Result<List<SellerListOutput>>.Success(result);
    }

    public async Task<Result<SellerGetOutput>> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);
        if (entity == null)
        {
            return Result<SellerGetOutput>.Failure("Seller not found");
        }

        var imageEntity =
            await fileRepository.ListAsync(TableNameEnum.Sellers, TargetNameEnum.SellerId, entity.Id, cancellation);
        var images = new List<SellerImageGetOutput>();
        foreach (var image in imageEntity)
        {
            var url = await fileService.GetUrlAsync(image.Url, cancellation);
            images.Add(new SellerImageGetOutput
            {
                Id = image.Id,
                Name = image.Name,
                Url = url,
                IsMain = image.IsMain,
                FileType = image.FileType,
            });
        }

        var output = new SellerGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity?.Description,
            Status = entity.Status,
            Images = images,
        };
        return Result<SellerGetOutput>.Success(output);
    }

    public async Task<Result<SellerCreateOutput>> CreateAsync(
        int userId,
        SellerCreateInput input,
        CancellationToken cancellation
    )
    {
        var entity = new SellerEntity
        {
            Name = input.Name,
            Description = input.Description,
            Status = SellerStatusEnum.Active,
            UserId = userId,
        };
        var created = await sellerRepository.CreateAsync(entity, cancellation);
        var result = new SellerCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            Status = created.Status,
        };
        return Result<SellerCreateOutput>.Success(result);
    }

    public async Task<Result<SellerUpdateOutput>> UpdateAsync(
        int id,
        int userId,
        SellerUpdateInput input,
        CancellationToken cancellation
    )
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);
        if (entity == null)
        {
            return Result<SellerUpdateOutput>.Failure("Seller not found");
        }

        entity.Name = input.Name;
        entity.Description = input?.Description;
        entity.Status = input.Status;
        var created = await sellerRepository.UpdateAsync(entity, cancellation);
        var result = new SellerUpdateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Description = created?.Description,
            Status = created.Status,
        };
        return Result<SellerUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> DeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);
        if (entity == null)
        {
            return Result<bool>.Failure("Seller not found");
        }

        await sellerRepository.DeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }
}
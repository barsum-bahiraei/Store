using Store.Domain.Files;
using Store.Domain.Sellers;
using Store.Domain.Sellers.Models.Input;
using Store.Domain.Sellers.Models.Output;

namespace Store.Service.EntityService;

public class SellerService(ISellerRepository sellerRepository, FileService fileService)
{
    public async Task<Result<List<SellerListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await sellerRepository.ListAsync(userId, cancellation);
        var result = new List<SellerListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Sellers,
                TargetNameEnum.SellerId,
                entity.Id,
                cancellation);

            SellerImageListOutput? image = null;

            if (imageResult.Data != null)
            {
                image = new SellerImageListOutput
                {
                    Id = imageResult.Data.Id,
                    Name = imageResult.Data.Name,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    FileType = imageResult.Data.FileType
                };
            }

            result.Add(new SellerListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Address = entity.Address,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
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
            return Result<SellerGetOutput>.Failure("Seller not found");

        var imagesResult = await fileService.ListAsync(
            TableNameEnum.Sellers,
            TargetNameEnum.SellerId,
            entity.Id,
            cancellation);

        var images = new List<SellerImageGetOutput>();

        if (imagesResult.Data != null)
        {
            foreach (var image in imagesResult.Data)
            {
                images.Add(new SellerImageGetOutput
                {
                    Id = image.Id,
                    Name = image.Name,
                    Url = image.Url,
                    IsMain = image.IsMain,
                    FileType = image.FileType
                });
            }
        }

        var output = new SellerGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Address = entity.Address,
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            Status = entity.Status,
            Images = images
        };

        return Result<SellerGetOutput>.Success(output);
    }

    public async Task<Result<SellerCreateOutput>> CreateAsync(int userId, SellerCreateInput input, CancellationToken cancellation)
    {
        var entity = new SellerEntity
        {
            Name = input.Name,
            Description = input.Description,
            Address = input.Address,
            Latitude = input.Latitude.Value,
            Longitude = input.Longitude.Value,
            Status = SellerStatusEnum.Active,
            UserId = userId
        };

        var created = await sellerRepository.CreateAsync(entity, cancellation);

        return Result<SellerCreateOutput>.Success(new SellerCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            Address = created.Address,
            Latitude = created.Latitude,
            Longitude = created.Longitude,
            Status = created.Status
        });
    }

    public async Task<Result<SellerUpdateOutput>> UpdateAsync(int id, int userId, SellerUpdateInput input, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<SellerUpdateOutput>.Failure("Seller not found");

        entity.Name = input.Name;
        entity.Description = input.Description;
        entity.Address = input.Address;
        entity.Latitude = input.Latitude;
        entity.Longitude = input.Longitude;
        entity.Status = input.Status;

        var updated = await sellerRepository.UpdateAsync(entity, cancellation);

        return Result<SellerUpdateOutput>.Success(new SellerUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            Description = updated.Description,
            Address = updated.Address,
            Latitude = updated.Latitude,
            Longitude = updated.Longitude,
            Status = updated.Status
        });
    }

    public async Task<Result<bool>> DeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<bool>.Failure("Seller not found");

        await sellerRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }
}

using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Store.Domain.Sellers;

namespace Store.Service.ProviderService;

public class ProductService(
    IProductRepository productRepository,
    ISellerRepository sellerRepository,
    FileService fileService)
{
    public async Task<Result<List<ProductListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await productRepository.ListAsync(userId, cancellation);
        var result = new List<ProductListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Products,
                TargetNameEnum.ProductId,
                entity.Id,
                cancellation);

            ProductImageListOutput? image = null;

            if (imageResult.Data != null)
            {
                image = new ProductImageListOutput
                {
                    Id = imageResult.Data.Id,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    Name = imageResult.Data.Name,
                    FileType = imageResult.Data.FileType
                };
            }

            result.Add(new ProductListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Price = entity.Price,
                Discount = entity.Discount,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                Image = image,
                Seller = new ProductSellerListOutput
                {
                    Id = entity.Seller.Id,
                    Name = entity.Seller.Name
                }
            });
        }

        return Result<List<ProductListOutput>>.Success(result);
    }

    public async Task<Result<ProductGetOutput?>> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<ProductGetOutput?>.Failure("Product not found");

        var imagesResult = await fileService.ListAsync(
            TableNameEnum.Products,
            TargetNameEnum.ProductId,
            entity.Id,
            cancellation);

        var images = new List<ProductImageGetOutput>();

        if (imagesResult.Data != null)
        {
            foreach (var image in imagesResult.Data)
            {
                images.Add(new ProductImageGetOutput
                {
                    Id = image.Id,
                    Url = image.Url,
                    IsMain = image.IsMain,
                    Name = image.Name,
                    FileType = image.FileType
                });
            }
        }

        var result = new ProductGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            Images = images,
            Seller = new ProductSellerGetOutput
            {
                Id = entity.Seller.Id,
                Name = entity.Seller.Name
            },
            Attributes = entity.ProductAttributes.Select(x => new ProductAttributeGetOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value,
                AttributeTitle = x.Attribute.Name,
                AttributeType = x.Attribute.Type,
                AttributeUnit = x.Attribute.Unit
            }).ToList()
        };

        return Result<ProductGetOutput?>.Success(result);
    }

    public async Task<Result<ProductCreateOutput>> CreateAsync(int userId, ProductCreateInput input, CancellationToken cancellation)
    {
        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("Seller not found");

        var entity = new ProductEntity
        {
            Name = input.Name,
            Description = input.Description,
            Price = input.Price,
            Discount = input.Discount,
            CategoryId = input.CategoryId,
            SellerId = input.SellerId,
            ProductAttributes = input.Attributes.Select(x => new ProductAttributeEntity
            {
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        };

        var created = await productRepository.CreateAsync(entity, cancellation);

        return Result<ProductCreateOutput>.Success(new ProductCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            Price = created.Price,
            Discount = created.Discount,
            CategoryId = created.CategoryId,
            SellerId = created.SellerId,
            Attributes = created.ProductAttributes.Select(x => new ProductAttributeOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        });
    }

    public async Task<Result<ProductUpdateOutput>> UpdateAsync(int id, int userId, ProductUpdateInput input, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<ProductUpdateOutput>.Failure("Product not found");

        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductUpdateOutput>.Failure("Seller not found");

        entity.Name = input.Name;
        entity.Description = input.Description;
        entity.Price = input.Price;
        entity.Discount = input.Discount;
        entity.CategoryId = input.CategoryId;
        entity.SellerId = input.SellerId;

        foreach (var item in input.Attributes)
        {
            var attribute = entity.ProductAttributes.FirstOrDefault(x => x.AttributeId == item.AttributeId);

            if (attribute != null)
                attribute.Value = item.Value;
        }

        var updated = await productRepository.UpdateAsync(entity, cancellation);

        return Result<ProductUpdateOutput>.Success(new ProductUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            Description = updated.Description,
            Price = updated.Price,
            Discount = updated.Discount,
            CategoryId = updated.CategoryId,
            CategoryTitle = updated.Category.Name,
            SellerId = updated.SellerId,
            Attributes = updated.ProductAttributes.Select(x => new ProductAttributeUpdateOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        });
    }

    public async Task<Result<bool>> DeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<bool>.Failure("Product not found");

        await productRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }
}
using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Store.Service.Files;

namespace Store.Service.Products;

public class ProductService(
    IProductRepository productRepository,
    IFileRepository fileRepository,
    FileService fileService)
{
    public async Task<Result<List<ProductListOutput>>> ListAsync(CancellationToken cancellation)
    {
        var entities = await productRepository.ListAsync(cancellation);

        var result = new List<ProductListOutput>();
        foreach (var entity in entities)
        {
            var imageEntity = await fileRepository.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, entity.Id, cancellation);
            var image = new ProductImageListOutput();
            if (imageEntity != null)
            {
                var url = await fileService.GetUrlAsync(imageEntity.Url, cancellation);
                image = new ProductImageListOutput
                {
                    Id = imageEntity.Id,
                    Url = url,
                    IsMain = imageEntity.IsMain,
                    Title = imageEntity.Title,
                    FileType = imageEntity.FileType,
                };
            }

            result.Add(new ProductListOutput
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                Price = entity.Price,
                Discount = entity.Discount,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Title,
                Image = image
            });
        }

        return Result<List<ProductListOutput>>.Success(result);
    }

    public async Task<Result<ProductGetOutput?>> GetAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<ProductGetOutput?>.Failure("Product not found");
        }

        var imagesEntity =
            await fileRepository.ListAsync(TableNameEnum.Products, TargetNameEnum.ProductId, entity.Id, cancellation);
        var images = new List<ProductImageGetOutput>();

        foreach (var image in imagesEntity)
        {
            var url = await fileService.GetUrlAsync(image.Url, cancellation);
            images.Add(new ProductImageGetOutput
            {
                Id = image.Id,
                Url = url,
                IsMain = image.IsMain,
                Title = image.Title,
                FileType = image.FileType,
            });
        }

        var result = new ProductGetOutput
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Title,
            Images = images,
            Attributes = entity.ProductAttributes.Select(x => new ProductAttributeGetOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value,
                AttributeTitle = x.Attribute.Title,
                AttributeType = x.Attribute.Type,
                AttributeUnit = x.Attribute.Unit,
            }).ToList()
        };
        return Result<ProductGetOutput?>.Success(result);
    }

    public async Task<Result<ProductCreateOutput>> CreateAsync(ProductCreateInput input, CancellationToken cancellation)
    {
        var entity = new ProductEntity
        {
            Title = input.Title,
            Description = input.Description,
            Price = input.Price,
            Discount = input.Discount,
            CategoryId = input.CategoryId,
            ProductAttributes = input.Attributes.Select(x => new ProductAttributeEntity
            {
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        };
        var created = await productRepository.CreateAsync(entity, cancellation);
        var result = new ProductCreateOutput
        {
            Id = created.Id,
            Title = created.Title,
            Description = created.Description,
            Price = created.Price,
            Discount = created.Discount,
            CategoryId = created.CategoryId,
            Attributes = created.ProductAttributes.Select(x => new ProductAttributeOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        };

        return Result<ProductCreateOutput>.Success(result);
    }

    public async Task<Result<ProductUpdateOutput>> UpdateAsync(int id, ProductUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<ProductUpdateOutput>.Failure("Product not found");
        }

        entity.Title = input.Title;
        entity.Description = input.Description;
        entity.Price = input.Price;
        entity.Discount = input.Discount;
        entity.CategoryId = input.CategoryId;
        foreach (var item in input.Attributes)
        {
            var attribute = entity.ProductAttributes.FirstOrDefault(x => x.AttributeId == item.AttributeId);
            if (attribute != null)
            {
                attribute.Value = item.Value;
            }
        }

        var updated = await productRepository.UpdateAsync(entity, cancellation);

        var result = new ProductUpdateOutput
        {
            Id = updated.Id,
            Title = updated.Title,
            Description = updated.Description,
            Price = updated.Price,
            Discount = updated.Discount,
            CategoryId = updated.CategoryId,
            CategoryTitle = updated.Category.Title,
            Attributes = updated.ProductAttributes.Select(x => new ProductAttributeUpdateOutput
            {
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        };

        return Result<ProductUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellation)
    {
        await productRepository.DeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
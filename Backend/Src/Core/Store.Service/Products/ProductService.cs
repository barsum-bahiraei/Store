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
        var result = entities
            .Select(x => new ProductListOutput
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Price = x.Price,
                Discount = x.Discount,
                CategoryId = x.CategoryId,
                CategoryTitle = x.Category.Title
            })
            .ToList();
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
        var images = new List<ProductImage>();

        foreach (var x in imagesEntity)
        {
            var url = await fileService.GetUrlAsync(x.Url, cancellation);
            images.Add(new ProductImage
            {
                Title = x.Title,
                Url = url,
                FileType = x.FileType,
                IsMain = x.IsMain,
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
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        };

        return Result<ProductCreateOutput>.Success(result);
    }

    public async Task<Result<ProductUpdateOutput>> UpdateAsync(int id, ProductUpdateInput input, CancellationToken cancellation)
    {
        var entity = new ProductEntity
        {
            Id = id,
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

        var updated = await productRepository.UpdateAsync(entity, cancellation);

        var result = new ProductUpdateOutput
        {
            Id = updated.Id,
            Title = updated.Title,
            Description = updated.Description,
            Price = updated.Price,
            Discount = updated.Discount,
            CategoryId = updated.CategoryId,
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
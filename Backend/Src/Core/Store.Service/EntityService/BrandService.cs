using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;

namespace Store.Service.EntityService;

internal class BrandService(IProductRepository productRepository, FileService fileService)
{
    public async Task<Result<List<ProductBrandListOutput>>> BrandListAsync(CancellationToken cancellation)
    {
        var entities = await productRepository.BrandListAsync(cancellation);
        var result = new List<ProductBrandListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.ProductBrands,
                TargetNameEnum.ProductBrandId,
                entity.Id,
                cancellation);

            result.Add(new ProductBrandListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Image = imageResult.Data == null
                    ? null
                    : new ProductBrandImageOutput
                    {
                        Id = imageResult.Data.Id,
                        Name = imageResult.Data.Name,
                        Url = imageResult.Data.Url,
                        IsMain = imageResult.Data.IsMain,
                        FileType = imageResult.Data.FileType
                    }
            });
        }

        return Result<List<ProductBrandListOutput>>.Success(result);
    }

    public async Task<Result<ProductBrandGetOutput?>> BrandGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.BrandGetAsync(id, cancellation);
        if (entity == null)
            return Result<ProductBrandGetOutput?>.Failure("Product brand not found");

        var imageResult = await fileService.GetAsync(
            TableNameEnum.ProductBrands,
            TargetNameEnum.ProductBrandId,
            entity.Id,
            cancellation);

        return Result<ProductBrandGetOutput?>.Success(new ProductBrandGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Image = imageResult.Data == null
                ? null
                : new ProductBrandImageOutput
                {
                    Id = imageResult.Data.Id,
                    Name = imageResult.Data.Name,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    FileType = imageResult.Data.FileType
                }
        });
    }

    public async Task<Result<ProductBrandCreateOutput>> BrandCreateAsync(ProductBrandCreateInput input,
        CancellationToken cancellation)
    {
        var created = await productRepository.BrandCreateAsync(new ProductBrandEntity
        {
            Name = input.Name
        }, cancellation);

        return Result<ProductBrandCreateOutput>.Success(new ProductBrandCreateOutput
        {
            Id = created.Id,
            Name = created.Name
        });
    }

    public async Task<Result<ProductBrandUpdateOutput>> BrandUpdateAsync(int id, ProductBrandUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await productRepository.BrandGetAsync(id, cancellation);
        if (entity == null)
            return Result<ProductBrandUpdateOutput>.Failure("Product brand not found");

        entity.Name = input.Name;
        var updated = await productRepository.BrandUpdateAsync(entity, cancellation);
        return Result<ProductBrandUpdateOutput>.Success(new ProductBrandUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name
        });
    }

    public async Task<Result<bool>> BrandDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.BrandGetAsync(id, cancellation);
        if (entity == null)
            return Result<bool>.Failure("Product brand not found");

        if (entity.Products.Count != 0)
            return Result<bool>.Failure("Product brand is in use");

        await productRepository.BrandDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }
}

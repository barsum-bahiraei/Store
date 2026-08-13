using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;

namespace Store.Service.Products;

public class ProductService(IProductRepository productRepository)
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
                CategoryTitle = x.Category.Title,
                MainImageUrl = x.MainImageUrl
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

        var result = new ProductGetOutput
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Title,
            MainImageUrl = entity.MainImageUrl
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

    public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellation)
    {
        await productRepository.DeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
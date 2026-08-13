using Store.Domain.Products;
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
}
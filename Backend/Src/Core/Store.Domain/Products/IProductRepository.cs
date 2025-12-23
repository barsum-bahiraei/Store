using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;

namespace Store.Domain.Products;

public interface IProductRepository
{
    Task<List<ProductEntity>> ListAsync(ProductListInput input, CancellationToken cancellation);
    Task DetailAsync(int productId, CancellationToken cancellation);
    Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation);
    Task<bool> DeleteAsync(int productId, CancellationToken cancellation);
}
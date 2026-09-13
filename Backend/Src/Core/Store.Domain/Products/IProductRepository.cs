using Store.Domain.Products.Models.Input;

namespace Store.Domain.Products;

public interface IProductRepository
{
    Task<List<ProductEntity>> ListAsync(int userId, CancellationToken cancellation);
    Task<List<ProductEntity>> SearchAsync(ProductSearchInput input, CancellationToken cancellation);
    Task<ProductEntity?> GetAsync(int id, CancellationToken cancellation);
    Task<ProductEntity?> GetAsync(int id, int userId, CancellationToken cancellation);
    Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation);
    Task DeleteAsync(ProductEntity input, CancellationToken cancellation);
}

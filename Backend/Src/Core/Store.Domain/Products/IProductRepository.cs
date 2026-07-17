namespace Store.Service.Products;

public interface IProductRepository
{
    Task<List<ProductEntity>> ListAsync(CancellationToken cancellation);
    Task<ProductEntity> GetAsync(int id, CancellationToken cancellation);
    Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation);
    Task DeleteAsync(int id, CancellationToken cancellation);
}
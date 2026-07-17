namespace Store.Service.Products;

public interface IProductRepository
{
    Task<List<ProductEntity>> ListAsync(CancellationToken cancellation);
    Task<ProductEntity> GetAsync(int id, CancellationToken cancellation);
    Task<ProductEntity> CreateAsync(ProductEntity parameters, CancellationToken cancellation);
    Task<ProductEntity> UpdateAsync(ProductEntity parameters, CancellationToken cancellation);
    Task DeleteAsync(int id, CancellationToken cancellation);
}
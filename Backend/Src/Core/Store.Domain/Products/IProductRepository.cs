using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;

namespace Store.Domain.Products;
public interface IProductRepository
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task<List<ProductListOutput>> ListAsync(ProductListInput parameters, CancellationToken cancellation);
    Task CreateAsync(CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);
}

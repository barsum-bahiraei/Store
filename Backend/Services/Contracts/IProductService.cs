using StoreBackend.Models;

namespace StoreBackend.Services.Contracts;
public interface IProductService
{
    Task<ProductDetailViewModel?> Detail(int id, CancellationToken cancellation);
    Task<int> Create(ProductCreateParameters parameters, CancellationToken cancellation);
    Task<List<ProductListViewModel>> List(ProductListParameters parameters, CancellationToken cancellation);
}
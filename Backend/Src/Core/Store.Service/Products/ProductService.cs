using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Service.Products;
public class ProductService(IProductRepository productRepository) : IProductService
{
    public Task CreateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<List<ProductListOutput>> ListAsync(ProductListInput parameters, CancellationToken cancellation)
    {
        var products = await productRepository.ListAsync(parameters, cancellation);
        return products;
    }

    public Task UpdateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}

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
    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task<List<ProductListOutput>> ListAsync(ProductListInput input, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task<ProductCreateOutput> CreateAsync(ProductCreateInput input, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}
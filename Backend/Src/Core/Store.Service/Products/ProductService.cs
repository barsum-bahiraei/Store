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
    public async Task<ProductCreateOutput> CreateAsync(ProductCreateInput input, CancellationToken cancellation)
    {
        var productEntity = new ProductEntity
        {
            Name = input.Name,
            Description = input.Description,
            Price = input.Price,
        };
        var product = await productRepository.CreateAsync(productEntity, cancellation);
        var result = new ProductCreateOutput
        {
            Name = product.Name,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            Id = product.Id,
            Description = product.Description,
        };
        return result;
    }

    public Task DeleteAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<List<ProductListOutput>> ListAsync(ProductListInput input, CancellationToken cancellation)
    {
        var products = await productRepository.ListAsync(input, cancellation);
        return products;
    }

    public Task UpdateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}
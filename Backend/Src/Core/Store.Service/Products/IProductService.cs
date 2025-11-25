using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Service.Products;

public interface IProductService
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task<List<ProductListOutput>> ListAsync(ProductListInput input, CancellationToken cancellation);
    Task<ProductCreateOutput> CreateAsync(ProductCreateInput input, CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);
}
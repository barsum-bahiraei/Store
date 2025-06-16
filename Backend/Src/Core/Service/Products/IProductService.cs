using Domain.Products.Models.Input;
using Domain.Products.Models.Output;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Products;
public interface IProductService
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task<List<ProductListOutput>> ListAsync(ProductListInput parameters, CancellationToken cancellation);
    Task CreateAsync(CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);
}

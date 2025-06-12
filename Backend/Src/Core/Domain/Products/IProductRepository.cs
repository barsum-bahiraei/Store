using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Products;
public interface IProductRepository
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task ListAsync(CancellationToken cancellation);
    Task CreateAsync(CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);

}

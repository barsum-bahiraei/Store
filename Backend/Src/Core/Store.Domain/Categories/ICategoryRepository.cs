using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Categories;

public interface ICategoryRepository
{
    Task<List<CategoryEntity>> ListAsync(CancellationToken cancellation);
    Task<CategoryEntity> CreateAsync(CategoryEntity input, CancellationToken cancellation);
}
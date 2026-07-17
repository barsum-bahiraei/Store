using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Domain.Categories;

public interface ICategoryRepository
{
    Task<List<CategoryEntity>> ListAsync(CancellationToken cancellation);
    Task<CategoryEntity> GetAsync(int id, CancellationToken cancellation);
    Task<CategoryEntity> CreateAsync(CategoryEntity input, CancellationToken cancellation);
    Task<CategoryEntity> UpdateAsync(CategoryEntity input, CancellationToken cancellation);
    Task DeleteAsync(int id, CancellationToken cancellation);
}
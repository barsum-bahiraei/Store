using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Domain.Categories;

public interface ICategoryRepository
{
    public Task<List<CategoryEntity>> CategoryListAsync(CancellationToken cancellation);
}

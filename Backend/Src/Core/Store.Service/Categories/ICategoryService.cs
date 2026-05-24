using Store.Domain.Categories.Models.Output;
using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Service.Categories;

public interface ICategoryService
{
    public Task<Result<List<CategoryListOutput>>> CategoryListAsync(CancellationToken cancellation);
}

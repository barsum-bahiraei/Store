using Store.Domain.Categories;
using Store.Domain.Categories.Models.Output;
using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<Result<List<CategoryListOutput>>> List(CancellationToken cancellation)
    {
        var result = await categoryRepository.List(cancellation);
        return Result<List<CategoryListOutput>>.Success(result);
    }
}

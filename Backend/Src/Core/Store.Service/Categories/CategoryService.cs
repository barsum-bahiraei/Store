using Store.Domain.Categories;
using Store.Domain.Categories.Models.Output;
using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository)
{
    public async Task<Result<List<CategoryListOutput>>> ListAsync(CancellationToken cancellation)
    {
        var categoryEntityList = await categoryRepository.ListAsync(cancellation);
        var result = categoryEntityList.Select(x => new CategoryListOutput
        {
            Id = x.Id,
            Title = x.Title
        }).ToList();

        return Result<List<CategoryListOutput>>.Success(result);
    }
}

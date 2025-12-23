using Store.Domain.Categories;
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<CategoryCreateOutput> CreateAsync(CategoryCreateInput input, CancellationToken cancellation)
    {
        var categoryEntity = new CategoryEntity
        {
            Name = input.Name,
            ParentId = input.ParentId,
        };
        var result =  await categoryRepository.CreateAsync(categoryEntity, cancellation);
        return new CategoryCreateOutput
        {
            Id = result.Id,
            Name = result.Name,
            ParentId = result.ParentId,
        };
    }
}
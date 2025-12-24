using Store.Domain.Categories;
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<List<CategoryListOutput>> ListAsync(CancellationToken cancellation)
    {
        var data = await categoryRepository.ListAsync(cancellation);
        var result = data
            .Where(x => x.ParentId == null)
            .Select(x => new CategoryListOutput
            {
                Id = x.Id,
                Name = x.Name,
                ParentId = x.ParentId,
                Children = data
                .Where(z => z.ParentId == x.Id)
                .Select(z => new CategoryListOutput
                {
                    Id = z.Id,
                    Name = z.Name,
                    ParentId = z.ParentId,
                })
                .ToList(),
            })
            .ToList();

        return result;
    }
    public async Task<CategoryCreateOutput> CreateAsync(CategoryCreateInput input, CancellationToken cancellation)
    {
        var categoryEntity = new CategoryEntity
        {
            Name = input.Name,
            ParentId = input.ParentId,
        };
        var result = await categoryRepository.CreateAsync(categoryEntity, cancellation);
        return new CategoryCreateOutput
        {
            Id = result.Id,
            Name = result.Name,
            ParentId = result.ParentId,
        };
    }
}
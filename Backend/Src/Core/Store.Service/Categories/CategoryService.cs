using Store.Domain.Categories;
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public Task DetailAsync(int id, CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public async Task<List<CategoryListOutput>> ListAsync(CategoryListInput parameters, CancellationToken cancellation)
    {
        var categories = await categoryRepository.ListAsync(parameters, cancellation);
        return categories;
    }

    public Task CreateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}
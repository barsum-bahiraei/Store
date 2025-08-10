using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Service.Categories;

public interface ICategoryService
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task<List<CategoryListOutput>> ListAsync(CategoryListInput input, CancellationToken cancellation);
    Task CreateAsync(CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);
}
using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Domain.Categories;

public interface ICategoryRepository
{
    Task DetailAsync(int id, CancellationToken cancellation);
    Task<List<CategoryListOutput>> ListAsync(CategoryListInput parameters,CancellationToken cancellation);
    Task CreateAsync(CancellationToken cancellation);
    Task UpdateAsync(CancellationToken cancellation);
    Task DeleteAsync(CancellationToken cancellation);
}
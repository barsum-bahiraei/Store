using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Service.Categories;

public interface ICategoryService
{
    Task<List<CategoryListOutput>> ListAsync(CancellationToken cancellation);
    Task<CategoryCreateOutput> CreateAsync(CategoryCreateInput input, CancellationToken cancellation);
}
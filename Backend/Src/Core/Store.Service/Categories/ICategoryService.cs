using Store.Domain.Categories.Models.Input;
using Store.Domain.Categories.Models.Output;

namespace Store.Service.Categories;

public interface ICategoryService
{
    Task<CategoryCreateOutput> CreateAsync(CategoryCreateInput input, CancellationToken cancellation);
}
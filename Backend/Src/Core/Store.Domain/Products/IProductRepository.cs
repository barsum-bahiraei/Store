using Store.Domain.Products.Models.Input;

namespace Store.Domain.Products;

public interface IProductRepository
{
    Task<List<ProductEntity>> ListAsync(int userId, CancellationToken cancellation);
    Task<(List<ProductEntity> Items, int TotalCount)> SearchAsync(ProductSearchInput input,
        CancellationToken cancellation);
    Task<ProductEntity?> GetAsync(int id, CancellationToken cancellation);
    Task<ProductEntity?> GetAsync(int id, int userId, CancellationToken cancellation);
    Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation);
    Task DeleteAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductCommentEntity> CommentCreateAsync(ProductCommentEntity input, CancellationToken cancellation);
    Task<List<ProductBookmarkEntity>> BookmarkListAsync(int userId, CancellationToken cancellation);
    Task<ProductBookmarkEntity?> BookmarkGetAsync(int productId, int userId, CancellationToken cancellation);
    Task<ProductBookmarkEntity> BookmarkCreateAsync(ProductBookmarkEntity input, CancellationToken cancellation);
    Task BookmarkDeleteAsync(ProductBookmarkEntity input, CancellationToken cancellation);
}

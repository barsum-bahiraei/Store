using Store.Domain.Products.Models.Input;

namespace Store.Domain.Products;

public interface IProductRepository
{
    Task<List<ProductEntity>> ListAsync(int userId, ProductListInput input, CancellationToken cancellation);
    Task<(List<ProductEntity> Items, int TotalCount)> SearchAsync(ProductSearchInput input,
        CancellationToken cancellation);
    Task<(List<ProductEntity> Items, int? TotalCount, int CurrentPage, string? NextCursor)> TorobListAsync(
        ProductTorobInput input, CancellationToken cancellation);
    Task<ProductEntity?> GetAsync(int id, CancellationToken cancellation);
    Task<ProductEntity?> GetAsync(int id, int userId, CancellationToken cancellation);
    Task<List<ProductEntity>> SimilarListAsync(int id, int categoryId, CancellationToken cancellation);
    Task<List<ProductBrandEntity>> BrandListAsync(CancellationToken cancellation);
    Task<ProductBrandEntity?> BrandGetAsync(int id, CancellationToken cancellation);
    Task<ProductBrandEntity> BrandCreateAsync(ProductBrandEntity input, CancellationToken cancellation);
    Task<ProductBrandEntity> BrandUpdateAsync(ProductBrandEntity input, CancellationToken cancellation);
    Task BrandDeleteAsync(ProductBrandEntity input, CancellationToken cancellation);
    Task<List<ProductVariantEntity>> VariantListAsync(CancellationToken cancellation);
    Task<List<ProductVariantEntity>> VariantListAsync(List<int> ids, CancellationToken cancellation);
    Task<ProductVariantEntity?> VariantGetAsync(int id, CancellationToken cancellation);
    Task<ProductVariantEntity> VariantCreateAsync(ProductVariantEntity input, CancellationToken cancellation);
    Task<ProductVariantEntity> VariantUpdateAsync(ProductVariantEntity input, CancellationToken cancellation);
    Task VariantDeleteAsync(ProductVariantEntity input, CancellationToken cancellation);
    Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation);
    Task DeleteAsync(ProductEntity input, CancellationToken cancellation);
    Task<ProductCommentEntity> CommentCreateAsync(ProductCommentEntity input, CancellationToken cancellation);
    Task<List<ProductBookmarkEntity>> BookmarkListAsync(int userId, CancellationToken cancellation);
    Task<ProductBookmarkEntity?> BookmarkGetAsync(int productId, int userId, CancellationToken cancellation);
    Task<ProductBookmarkEntity> BookmarkCreateAsync(ProductBookmarkEntity input, CancellationToken cancellation);
    Task BookmarkDeleteAsync(ProductBookmarkEntity input, CancellationToken cancellation);
}

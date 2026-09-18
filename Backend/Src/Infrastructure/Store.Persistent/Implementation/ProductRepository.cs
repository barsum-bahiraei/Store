using Microsoft.EntityFrameworkCore;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class ProductRepository(StoreDbContext context) : IProductRepository
{
    public async Task<List<ProductEntity>> ListAsync(int userId, ProductListInput input, CancellationToken cancellation)
    {
        var query = context.Products
            .Where(x => x.Seller.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(input.Name))
            query = query.Where(x => x.Name.Contains(input.Name.Trim()));

        if (input.CategoryId.HasValue)
            query = query.Where(x => x.CategoryId == input.CategoryId.Value);

        if (input.SellerId.HasValue)
            query = query.Where(x => x.SellerId == input.SellerId.Value);

        if (input.MinPrice.HasValue)
            query = query.Where(x => x.Price >= input.MinPrice.Value);

        if (input.MaxPrice.HasValue)
            query = query.Where(x => x.Price <= input.MaxPrice.Value);

        if (input.IsAvailable.HasValue)
            query = query.Where(x => x.IsAvailable == input.IsAvailable.Value);

        var result = await query
            .Include(x => x.Category)
            .Include(x => x.Seller)
            .OrderByDescending(x => x.Id)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<(List<ProductEntity> Items, int TotalCount)> SearchAsync(ProductSearchInput input,
        CancellationToken cancellation)
    {
        var query = context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(input.Name))
            query = query.Where(x => x.Name.Contains(input.Name.Trim()));

        if (input.CategoryId.HasValue)
            query = query.Where(x => x.CategoryId == input.CategoryId.Value);

        if (input.ProductBrandId.HasValue)
            query = query.Where(x => x.ProductBrandId == input.ProductBrandId.Value);

        if (input.HasDiscount)
            query = query.Where(x => x.Discount > 0);

        if (input.MinPrice.HasValue)
            query = query.Where(x => x.Price >= input.MinPrice.Value);

        if (input.MaxPrice.HasValue)
            query = query.Where(x => x.Price <= input.MaxPrice.Value);

        if (input.IsAvailable.HasValue)
            query = query.Where(x => x.IsAvailable == input.IsAvailable.Value);

        var totalCount = await query.CountAsync(cancellation);
        var page = input.Page < 1 ? 1 : input.Page;
        var pageSize = input.PageSize < 1 ? 10 : input.PageSize;

        query = input.IsIdDec
            ? input.IsPriceDec
                ? query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Price)
                : query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Price)
            : input.IsPriceDec
                ? query.OrderByDescending(x => x.Price)
                : query.OrderBy(x => x.Price);

        var result = await query
            .Include(x => x.Category)
            .Include(x => x.ProductComments)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellation);
        return (result, totalCount);
    }

    public async Task<ProductEntity?> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Seller)
            .Include(x => x.Category)
            .Include(x => x.ProductBrand)
            .Include(x => x.ProductVariants)
            .Include(x => x.ProductAttributes)
            .ThenInclude(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.Id == id && x.Seller.UserId == userId, cancellation);
        return result;
    }
    
    public async Task<ProductEntity?> GetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Seller)
            .Include(x => x.Category)
            .Include(x => x.ProductBrand)
            .Include(x => x.ProductVariants)
            .Include(x => x.ProductComments)
            .ThenInclude(x => x.User)
            .Include(x => x.ProductAttributes)
            .ThenInclude(x => x.Attribute)
            .FirstOrDefaultAsync(x => x.Id == id , cancellation);
        return result;
    }

    public async Task<List<ProductEntity>> SimilarListAsync(int id, int categoryId,
        CancellationToken cancellation)
    {
        var result = await context.Products
            .Where(x => x.Id != id && x.CategoryId == categoryId)
            .Include(x => x.Category)
            .Include(x => x.ProductComments)
            .OrderByDescending(x => x.ProductComments
                .Where(comment => comment.IsShow == true && comment.Rating.HasValue)
                .Average(comment => (decimal?)comment.Rating) ?? 0)
            .ThenByDescending(x => x.Id)
            .Take(5)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<List<ProductBrandEntity>> BrandListAsync(CancellationToken cancellation)
    {
        var result = await context.ProductBrands
            .OrderBy(x => x.Id)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<ProductBrandEntity?> BrandGetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.ProductBrands
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<ProductBrandEntity> BrandCreateAsync(ProductBrandEntity input, CancellationToken cancellation)
    {
        await context.ProductBrands.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<ProductBrandEntity> BrandUpdateAsync(ProductBrandEntity input, CancellationToken cancellation)
    {
        context.ProductBrands.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task BrandDeleteAsync(ProductBrandEntity input, CancellationToken cancellation)
    {
        context.ProductBrands.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task<List<ProductVariantEntity>> VariantListAsync(CancellationToken cancellation)
    {
        var result = await context.ProductVariants
            .OrderBy(x => x.Id)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<List<ProductVariantEntity>> VariantListAsync(List<int> ids, CancellationToken cancellation)
    {
        var result = await context.ProductVariants
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<ProductVariantEntity?> VariantGetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.ProductVariants
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<ProductVariantEntity> VariantCreateAsync(ProductVariantEntity input,
        CancellationToken cancellation)
    {
        await context.ProductVariants.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<ProductVariantEntity> VariantUpdateAsync(ProductVariantEntity input,
        CancellationToken cancellation)
    {
        context.ProductVariants.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task VariantDeleteAsync(ProductVariantEntity input, CancellationToken cancellation)
    {
        context.ProductVariants.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task<ProductEntity> CreateAsync(ProductEntity input, CancellationToken cancellation)
    {
        await context.Products.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<ProductEntity> UpdateAsync(ProductEntity input, CancellationToken cancellation)
    {
        context.Products.Update(input);
        await context.SaveChangesAsync(cancellation);
        var entity = await context.Products
            .Include(x => x.Category)
            .Include(x => x.ProductBrand)
            .Include(x => x.ProductVariants)
            .FirstOrDefaultAsync(x => x.Id == input.Id, cancellation);
        return entity;
    }

    public async Task DeleteAsync(ProductEntity input, CancellationToken cancellation)
    {
        context.Products.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task<ProductCommentEntity> CommentCreateAsync(ProductCommentEntity input,
        CancellationToken cancellation)
    {
        await context.ProductComments.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<List<ProductBookmarkEntity>> BookmarkListAsync(int userId, CancellationToken cancellation)
    {
        var result = await context.ProductBookmarks
            .Where(x => x.UserId == userId)
            .Include(x => x.Product)
            .ThenInclude(x => x.Category)
            .Include(x => x.Product)
            .ThenInclude(x => x.Seller)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<ProductBookmarkEntity?> BookmarkGetAsync(int productId, int userId, CancellationToken cancellation)
    {
        var result = await context.ProductBookmarks
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.UserId == userId, cancellation);
        return result;
    }

    public async Task<ProductBookmarkEntity> BookmarkCreateAsync(ProductBookmarkEntity input, CancellationToken cancellation)
    {
        await context.ProductBookmarks.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task BookmarkDeleteAsync(ProductBookmarkEntity input, CancellationToken cancellation)
    {
        context.ProductBookmarks.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }
}

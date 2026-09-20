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

    public async Task<(List<ProductEntity> Items, int? TotalCount, int CurrentPage, string? NextCursor)> TorobListAsync(
        ProductTorobInput input, CancellationToken cancellation)
    {
        const int pageSize = 100;
        var currentPage = input.Page ?? 1;
        int? totalCount;
        string? nextCursor = null;

        var query = context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Seller)
            .Include(x => x.ProductAttributes)
            .ThenInclude(x => x.Attribute)
            .AsQueryable();

        if (input.ProductIds != null)
        {
            var entities = await query
                .Where(x => input.ProductIds.Contains(x.Id))
                .ToListAsync(cancellation);
            var entitiesById = entities.ToDictionary(x => x.Id);
            var result = input.ProductIds
                .Where(entitiesById.ContainsKey)
                .Select(x => entitiesById[x])
                .ToList();
            return (result, result.Count, currentPage, nextCursor);
        }

        if (input.Page.HasValue)
        {
            totalCount = await query.CountAsync(cancellation);
            query = input.Sort == "date_added_desc"
                ? query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
                : query.OrderByDescending(x => x.UpdatedAt).ThenByDescending(x => x.Id);
            var result = await query
                .Skip((currentPage - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellation);
            return (result, totalCount, currentPage, nextCursor);
        }

        if (input.CursorId.HasValue)
        {
            currentPage = await context.Products
                .CountAsync(x => x.Id >= input.CursorId.Value, cancellation) / pageSize + 1;
            query = query.Where(x => x.Id < input.CursorId.Value);
        }

        var cursorEntities = await query
            .OrderByDescending(x => x.Id)
            .Take(pageSize + 1)
            .ToListAsync(cancellation);
        var hasMore = cursorEntities.Count > pageSize;
        var cursorResult = cursorEntities.Take(pageSize).ToList();
        if (hasMore)
            nextCursor = cursorResult[^1].Id.ToString();

        return (cursorResult, null, currentPage, nextCursor);
    }

    public async Task<ProductEntity?> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var result = await context.Products
            .Include(x => x.Seller)
            .Include(x => x.Category)
            .Include(x => x.ProductBrand)
            .Include(x => x.ProductVariants)
            .ThenInclude(x => x.Variant)
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
            .ThenInclude(x => x.Variant)
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

    public async Task<List<VariantEntity>> VariantListAsync(CancellationToken cancellation)
    {
        var result = await context.Variants
            .OrderBy(x => x.Id)
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<List<VariantEntity>> VariantListAsync(List<int> ids, CancellationToken cancellation)
    {
        var result = await context.Variants
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellation);
        return result;
    }

    public async Task<VariantEntity?> VariantGetAsync(int id, CancellationToken cancellation)
    {
        var result = await context.Variants
            .Include(x => x.ProductVariants)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<VariantEntity> VariantCreateAsync(VariantEntity input,
        CancellationToken cancellation)
    {
        await context.Variants.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<VariantEntity> VariantUpdateAsync(VariantEntity input,
        CancellationToken cancellation)
    {
        context.Variants.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task VariantDeleteAsync(VariantEntity input, CancellationToken cancellation)
    {
        context.Variants.Remove(input);
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
            .ThenInclude(x => x.Variant)
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

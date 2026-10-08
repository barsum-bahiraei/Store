using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;

namespace Store.Service.EntityService;

internal class ProductInteractionService(IProductRepository productRepository, FileService fileService)
{
    public async Task<Result<ProductCommentCreateOutput>> CommentCreateAsync(int productId, int userId,
        ProductCommentCreateInput input, CancellationToken cancellation)
    {
        if (input.Rating is < 1 or > 5)
            return Result<ProductCommentCreateOutput>.Failure("Rating must be between 1 and 5");

        if (await productRepository.GetAsync(productId, cancellation) == null)
            return Result<ProductCommentCreateOutput>.Failure("Product not found");

        var entity = new ProductCommentEntity
        {
            Text = input.Text,
            Rating = input.Rating,
            IsShow = true,
            UserId = userId,
            ProductId = productId
        };

        var created = await productRepository.CommentCreateAsync(entity, cancellation);
        return Result<ProductCommentCreateOutput>.Success(new ProductCommentCreateOutput
        {
            Id = created.Id,
            Text = created.Text,
            Rating = created.Rating,
            IsShow = created.IsShow,
            UserId = created.UserId,
            ProductId = created.ProductId,
            CreatedAt = created.CreatedAt
        });
    }

    public async Task<Result<List<ProductBookmarkListOutput>>> BookmarkListAsync(int userId,
        CancellationToken cancellation)
    {
        var entities = await productRepository.BookmarkListAsync(userId, cancellation);
        var result = new List<ProductBookmarkListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Products,
                TargetNameEnum.ProductId,
                entity.ProductId,
                cancellation);

            ProductBookmarkImageOutput? image = null;

            if (imageResult.Data != null)
            {
                image = new ProductBookmarkImageOutput
                {
                    Id = imageResult.Data.Id,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    Name = imageResult.Data.Name,
                    FileType = imageResult.Data.FileType
                };
            }

            result.Add(new ProductBookmarkListOutput
            {
                Id = entity.Id,
                ProductId = entity.ProductId,
                UserId = entity.UserId,
                CreatedAt = entity.CreatedAt,
                Product = new ProductBookmarkProductOutput
                {
                    Id = entity.Product.Id,
                    Name = entity.Product.Name,
                    ShortDescription = entity.Product.ShortDescription,
                    Price = GetDisplayPrice(entity.Product),
                    Discount = entity.Product.Discount,
                    CategoryId = entity.Product.CategoryId,
                    CategoryTitle = entity.Product.Category.Name,
                    Image = image
                }
            });
        }

        return Result<List<ProductBookmarkListOutput>>.Success(result);
    }

    public async Task<Result<bool>> BookmarkCreateAsync(int productId, int userId, CancellationToken cancellation)
    {
        if (await productRepository.GetAsync(productId, cancellation) == null)
            return Result<bool>.Failure("Product not found");

        var existing = await productRepository.BookmarkGetAsync(productId, userId, cancellation);
        if (existing != null)
            return Result<bool>.Failure("Already bookmarked");

        var entity = new ProductBookmarkEntity
        {
            ProductId = productId,
            UserId = userId
        };

        await productRepository.BookmarkCreateAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> BookmarkDeleteAsync(int productId, int userId, CancellationToken cancellation)
    {
        var entity = await productRepository.BookmarkGetAsync(productId, userId, cancellation);
        if (entity == null)
            return Result<bool>.Failure("Bookmark not found");

        await productRepository.BookmarkDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    private static decimal GetDisplayPrice(ProductEntity product)
    {
        var availablePrices = product.ProductVariants.Where(x => x.Stock > 0).Select(x => x.Price).ToList();
        return availablePrices.Count > 0
            ? availablePrices.Min()
            : product.ProductVariants.Select(x => x.Price).DefaultIfEmpty(0).Min();
    }
}

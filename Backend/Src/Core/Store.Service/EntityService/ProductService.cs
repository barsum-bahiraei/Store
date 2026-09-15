using Store.Domain.Categories;
using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Store.Domain.Sellers;

namespace Store.Service.EntityService;

public class ProductService(
    IProductRepository productRepository,
    ISellerRepository sellerRepository,
    ICategoryRepository categoryRepository,
    FileService fileService)
{
    public async Task<Result<List<ProductListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await productRepository.ListAsync(userId, cancellation);
        var result = new List<ProductListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Products,
                TargetNameEnum.ProductId,
                entity.Id,
                cancellation);

            ProductImageListOutput? image = null;

            if (imageResult.Data != null)
            {
                image = new ProductImageListOutput
                {
                    Id = imageResult.Data.Id,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    Name = imageResult.Data.Name,
                    FileType = imageResult.Data.FileType
                };
            }

            result.Add(new ProductListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Price = entity.Price,
                Discount = entity.Discount,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                Image = image,
                Seller = new ProductSellerListOutput
                {
                    Id = entity.Seller.Id,
                    Name = entity.Seller.Name
                }
            });
        }

        return Result<List<ProductListOutput>>.Success(result);
    }

    public async Task<Result<ProductSearchOutput>> SearchAsync(ProductSearchInput input,
        CancellationToken cancellation)
    {
        var entities = await productRepository.SearchAsync(input, cancellation);
        var items = new List<ProductSearchItemOutput>();

        foreach (var entity in entities.Items)
        {
            var ratings = entity.Comments.Where(x => x.IsShow == true && x.Rating.HasValue).ToList();
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Products,
                TargetNameEnum.ProductId,
                entity.Id,
                cancellation);

            ProductImageSearchOutput? image = null;

            if (imageResult.Data != null)
            {
                image = new ProductImageSearchOutput
                {
                    Id = imageResult.Data.Id,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    Name = imageResult.Data.Name,
                    FileType = imageResult.Data.FileType
                };
            }

            items.Add(new ProductSearchItemOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Price = entity.Price,
                Discount = entity.Discount,
                AverageRating = ratings.Count != 0
                    ? ratings.Average(x => (decimal)x.Rating!.Value)
                    : 0,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                Image = image
            });
        }

        var result = new ProductSearchOutput
        {
            TotalCount = entities.TotalCount,
            Items = items
        };
        return Result<ProductSearchOutput>.Success(result);
    }

    public async Task<Result<ProductDetailOutput?>> DetailAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, cancellation);

        if (entity == null)
            return Result<ProductDetailOutput?>.Failure("Product not found");

        var categoryEntities = await categoryRepository.ListAsync(cancellation);
        var categories = new List<ProductCategoryDetailOutput>();
        CategoryEntity? category = entity.Category;
        while (category != null)
        {
            categories.Add(new ProductCategoryDetailOutput
            {
                Id = category.Id,
                Name = category.Name,
                ParentId = category.ParentId
            });
            category = category.ParentId.HasValue
                ? categoryEntities.FirstOrDefault(x => x.Id == category.ParentId.Value)
                : null;
        }
        categories.Reverse();

        var imagesResult = await fileService.ListAsync(
            TableNameEnum.Products,
            TargetNameEnum.ProductId,
            entity.Id,
            cancellation);

        var images = new List<ProductImageDetailOutput>();

        if (imagesResult.Data != null)
        {
            foreach (var image in imagesResult.Data)
            {
                images.Add(new ProductImageDetailOutput
                {
                    Id = image.Id,
                    Url = image.Url,
                    IsMain = image.IsMain,
                    Name = image.Name,
                    FileType = image.FileType
                });
            }
        }

        var result = new ProductDetailOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            Categories = categories,
            Images = images,
            Seller = new ProductSellerDetailOutput
            {
                Id = entity.Seller.Id,
                Name = entity.Seller.Name
            },
            Attributes = entity.ProductAttributes.Select(x => new ProductAttributeDetailOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value,
                AttributeTitle = x.Attribute.Name,
                AttributeType = x.Attribute.Type,
                AttributeUnit = x.Attribute.Unit
            }).ToList(),
            Comments = entity.Comments
                .Where(x => x.IsShow == true)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new ProductCommentDetailOutput
                {
                    Id = x.Id,
                    Text = x.Text,
                    Rating = x.Rating,
                    CreatedAt = x.CreatedAt,
                    User = new ProductCommentUserDetailOutput
                    {
                        Id = x.User.Id,
                        FirstName = x.User.FirstName,
                        LastName = x.User.LastName
                    }
                }).ToList()
        };

        return Result<ProductDetailOutput?>.Success(result);
    }

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

    public async Task<Result<ProductGetOutput?>> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<ProductGetOutput?>.Failure("Product not found");

        var imagesResult = await fileService.ListAsync(
            TableNameEnum.Products,
            TargetNameEnum.ProductId,
            entity.Id,
            cancellation);

        var images = new List<ProductImageGetOutput>();

        if (imagesResult.Data != null)
        {
            foreach (var image in imagesResult.Data)
            {
                images.Add(new ProductImageGetOutput
                {
                    Id = image.Id,
                    Url = image.Url,
                    IsMain = image.IsMain,
                    Name = image.Name,
                    FileType = image.FileType
                });
            }
        }

        var result = new ProductGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            Images = images,
            Seller = new ProductSellerGetOutput
            {
                Id = entity.Seller.Id,
                Name = entity.Seller.Name
            },
            Attributes = entity.ProductAttributes.Select(x => new ProductAttributeGetOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value,
                AttributeTitle = x.Attribute.Name,
                AttributeType = x.Attribute.Type,
                AttributeUnit = x.Attribute.Unit
            }).ToList()
        };

        return Result<ProductGetOutput?>.Success(result);
    }

    public async Task<Result<ProductCreateOutput>> CreateAsync(int userId, ProductCreateInput input, CancellationToken cancellation)
    {
        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("Seller not found");

        var entity = new ProductEntity
        {
            Name = input.Name,
            Description = input.Description,
            Price = input.Price,
            Discount = input.Discount,
            CategoryId = input.CategoryId,
            SellerId = input.SellerId,
            ProductAttributes = input.Attributes.Select(x => new ProductAttributeEntity
            {
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        };

        var created = await productRepository.CreateAsync(entity, cancellation);

        return Result<ProductCreateOutput>.Success(new ProductCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            Price = created.Price,
            Discount = created.Discount,
            CategoryId = created.CategoryId,
            SellerId = created.SellerId,
            Attributes = created.ProductAttributes.Select(x => new ProductAttributeOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        });
    }

    public async Task<Result<ProductUpdateOutput>> UpdateAsync(int id, int userId, ProductUpdateInput input, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<ProductUpdateOutput>.Failure("Product not found");

        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductUpdateOutput>.Failure("Seller not found");

        entity.Name = input.Name;
        entity.Description = input.Description;
        entity.Price = input.Price;
        entity.Discount = input.Discount;
        entity.CategoryId = input.CategoryId;
        entity.SellerId = input.SellerId;

        foreach (var item in input.Attributes)
        {
            var attribute = entity.ProductAttributes.FirstOrDefault(x => x.AttributeId == item.AttributeId);

            if (attribute != null)
                attribute.Value = item.Value;
        }

        var updated = await productRepository.UpdateAsync(entity, cancellation);

        return Result<ProductUpdateOutput>.Success(new ProductUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            Description = updated.Description,
            Price = updated.Price,
            Discount = updated.Discount,
            CategoryId = updated.CategoryId,
            CategoryTitle = updated.Category.Name,
            SellerId = updated.SellerId,
            Attributes = updated.ProductAttributes.Select(x => new ProductAttributeUpdateOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList()
        });
    }

    public async Task<Result<bool>> DeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<bool>.Failure("Product not found");

        await productRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }
}

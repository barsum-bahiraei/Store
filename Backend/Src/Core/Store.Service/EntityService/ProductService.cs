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
    public async Task<Result<List<ProductListOutput>>> ListAsync(int userId, ProductListInput input, CancellationToken cancellation)
    {
        var entities = await productRepository.ListAsync(userId, input, cancellation);
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
                ShortDescription = entity.ShortDescription,
                Price = entity.Price,
                Discount = entity.Discount,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                IsAvailable = entity.IsAvailable,
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
            var ratings = entity.ProductComments.Where(x => x.IsShow == true && x.Rating.HasValue).ToList();
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
                ShortDescription = entity.ShortDescription,
                Price = entity.Price,
                Discount = entity.Discount,
                AverageRating = ratings.Count != 0
                    ? ratings.Average(x => (decimal)x.Rating!.Value)
                    : 0,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                IsAvailable = entity.IsAvailable,
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

        ProductBrandDetailOutput? brand = null;
        if (entity.ProductBrand != null)
        {
            var brandImageResult = await fileService.GetAsync(
                TableNameEnum.ProductBrands,
                TargetNameEnum.ProductBrandId,
                entity.ProductBrand.Id,
                cancellation);

            brand = new ProductBrandDetailOutput
            {
                Id = entity.ProductBrand.Id,
                Name = entity.ProductBrand.Name,
                Image = brandImageResult.Data == null
                    ? null
                    : new ProductBrandImageDetailOutput
                    {
                        Id = brandImageResult.Data.Id,
                        Name = brandImageResult.Data.Name,
                        Url = brandImageResult.Data.Url,
                        FileType = brandImageResult.Data.FileType
                    }
            };
        }

        var similarEntities = await productRepository.SimilarListAsync(
            entity.Id,
            entity.CategoryId,
            cancellation);
        var similarProducts = new List<ProductSimilarDetailOutput>();

        foreach (var similarEntity in similarEntities)
        {
            var ratings = similarEntity.ProductComments
                .Where(x => x.IsShow == true && x.Rating.HasValue)
                .ToList();
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Products,
                TargetNameEnum.ProductId,
                similarEntity.Id,
                cancellation);

            similarProducts.Add(new ProductSimilarDetailOutput
            {
                Id = similarEntity.Id,
                Name = similarEntity.Name,
                ShortDescription = similarEntity.ShortDescription,
                Price = similarEntity.Price,
                Discount = similarEntity.Discount,
                AverageRating = ratings.Count != 0
                    ? ratings.Average(x => (decimal)x.Rating!.Value)
                    : 0,
                CategoryId = similarEntity.CategoryId,
                CategoryTitle = similarEntity.Category.Name,
                IsAvailable = similarEntity.IsAvailable,
                Image = imageResult.Data == null
                    ? null
                    : new ProductImageDetailOutput
                    {
                        Id = imageResult.Data.Id,
                        Name = imageResult.Data.Name,
                        Url = imageResult.Data.Url,
                        IsMain = imageResult.Data.IsMain,
                        FileType = imageResult.Data.FileType
                    }
            });
        }

        var result = new ProductDetailOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            ShortDescription = entity.ShortDescription,
            LongDescription = entity.LongDescription,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            IsAvailable = entity.IsAvailable,
            Categories = categories,
            Brand = brand,
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
            Comments = entity.ProductComments
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
                }).ToList(),
            Variants = entity.ProductVariants.Select(x => new ProductVariantDetailOutput
            {
                Id = x.Id,
                ColorName = x.ColorName,
                ColorCode = x.ColorCode
            }).ToList(),
            SimilarProducts = similarProducts
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

        ProductBrandGetOutput? brand = null;
        if (entity.ProductBrand != null)
        {
            var brandImageResult = await fileService.GetAsync(
                TableNameEnum.ProductBrands,
                TargetNameEnum.ProductBrandId,
                entity.ProductBrand.Id,
                cancellation);

            brand = new ProductBrandGetOutput
            {
                Id = entity.ProductBrand.Id,
                Name = entity.ProductBrand.Name,
                Image = brandImageResult.Data == null
                    ? null
                    : new ProductBrandImageOutput
                    {
                        Id = brandImageResult.Data.Id,
                        Name = brandImageResult.Data.Name,
                        Url = brandImageResult.Data.Url,
                        IsMain = brandImageResult.Data.IsMain,
                        FileType = brandImageResult.Data.FileType
                    }
            };
        }

        var result = new ProductGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            ShortDescription = entity.ShortDescription,
            LongDescription = entity.LongDescription,
            Price = entity.Price,
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            Brand = brand,
            IsAvailable = entity.IsAvailable,
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
            }).ToList(),
            Variants = entity.ProductVariants.Select(x => new ProductVariantGetOutput
            {
                Id = x.Id,
                ColorName = x.ColorName,
                ColorCode = x.ColorCode
            }).ToList()
        };

        return Result<ProductGetOutput?>.Success(result);
    }

    public async Task<Result<ProductCreateOutput>> CreateAsync(int userId, ProductCreateInput input, CancellationToken cancellation)
    {
        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("Seller not found");

        if (await productRepository.BrandGetAsync(input.ProductBrandId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("Product brand not found");

        var variantIds = input.ProductVariantIds.Distinct().ToList();
        var variants = await productRepository.VariantListAsync(variantIds, cancellation);
        if (variants.Count != variantIds.Count)
            return Result<ProductCreateOutput>.Failure("Product variant not found");

        var entity = new ProductEntity
        {
            Name = input.Name,
            ShortDescription = input.ShortDescription,
            LongDescription = input.LongDescription,
            Price = input.Price,
            Discount = input.Discount,
            CategoryId = input.CategoryId,
            SellerId = input.SellerId,
            ProductBrandId = input.ProductBrandId,
            IsAvailable = input.IsAvailable,
            ProductAttributes = input.Attributes.Select(x => new ProductAttributeEntity
            {
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList(),
            ProductVariants = variants
        };

        var created = await productRepository.CreateAsync(entity, cancellation);

        return Result<ProductCreateOutput>.Success(new ProductCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            ShortDescription = created.ShortDescription,
            LongDescription = created.LongDescription,
            Price = created.Price,
            Discount = created.Discount,
            CategoryId = created.CategoryId,
            SellerId = created.SellerId,
            ProductBrandId = created.ProductBrandId,
            IsAvailable = created.IsAvailable,
            Attributes = created.ProductAttributes.Select(x => new ProductAttributeOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList(),
            Variants = created.ProductVariants.Select(x => new ProductVariantCreateOutput
            {
                Id = x.Id,
                ColorName = x.ColorName,
                ColorCode = x.ColorCode
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

        if (await productRepository.BrandGetAsync(input.ProductBrandId, cancellation) == null)
            return Result<ProductUpdateOutput>.Failure("Product brand not found");

        var variantIds = input.ProductVariantIds.Distinct().ToList();
        var variants = await productRepository.VariantListAsync(variantIds, cancellation);
        if (variants.Count != variantIds.Count)
            return Result<ProductUpdateOutput>.Failure("Product variant not found");

        entity.Name = input.Name;
        entity.ShortDescription = input.ShortDescription;
        entity.LongDescription = input.LongDescription;
        entity.Price = input.Price;
        entity.Discount = input.Discount;
        entity.CategoryId = input.CategoryId;
        entity.SellerId = input.SellerId;
        entity.ProductBrandId = input.ProductBrandId;
        entity.IsAvailable = input.IsAvailable;

        foreach (var item in input.Attributes)
        {
            var attribute = entity.ProductAttributes.FirstOrDefault(x => x.AttributeId == item.AttributeId);

            if (attribute != null)
                attribute.Value = item.Value;
        }

        entity.ProductVariants.Clear();
        foreach (var item in variants)
            entity.ProductVariants.Add(item);

        var updated = await productRepository.UpdateAsync(entity, cancellation);

        return Result<ProductUpdateOutput>.Success(new ProductUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            ShortDescription = updated.ShortDescription,
            LongDescription = updated.LongDescription,
            Price = updated.Price,
            Discount = updated.Discount,
            CategoryId = updated.CategoryId,
            CategoryTitle = updated.Category.Name,
            SellerId = updated.SellerId,
            ProductBrandId = updated.ProductBrandId,
            IsAvailable = updated.IsAvailable,
            Attributes = updated.ProductAttributes.Select(x => new ProductAttributeUpdateOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList(),
            Variants = updated.ProductVariants.Select(x => new ProductVariantUpdateOutput
            {
                Id = x.Id,
                ColorName = x.ColorName,
                ColorCode = x.ColorCode
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

    public async Task<Result<List<ProductBrandListOutput>>> BrandListAsync(CancellationToken cancellation)
    {
        var entities = await productRepository.BrandListAsync(cancellation);
        var result = new List<ProductBrandListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.ProductBrands,
                TargetNameEnum.ProductBrandId,
                entity.Id,
                cancellation);

            result.Add(new ProductBrandListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Image = imageResult.Data == null
                    ? null
                    : new ProductBrandImageOutput
                    {
                        Id = imageResult.Data.Id,
                        Name = imageResult.Data.Name,
                        Url = imageResult.Data.Url,
                        IsMain = imageResult.Data.IsMain,
                        FileType = imageResult.Data.FileType
                    }
            });
        }

        return Result<List<ProductBrandListOutput>>.Success(result);
    }

    public async Task<Result<ProductBrandGetOutput?>> BrandGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.BrandGetAsync(id, cancellation);
        if (entity == null)
            return Result<ProductBrandGetOutput?>.Failure("Product brand not found");

        var imageResult = await fileService.GetAsync(
            TableNameEnum.ProductBrands,
            TargetNameEnum.ProductBrandId,
            entity.Id,
            cancellation);

        return Result<ProductBrandGetOutput?>.Success(new ProductBrandGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Image = imageResult.Data == null
                ? null
                : new ProductBrandImageOutput
                {
                    Id = imageResult.Data.Id,
                    Name = imageResult.Data.Name,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    FileType = imageResult.Data.FileType
                }
        });
    }

    public async Task<Result<ProductBrandCreateOutput>> BrandCreateAsync(ProductBrandCreateInput input,
        CancellationToken cancellation)
    {
        var created = await productRepository.BrandCreateAsync(new ProductBrandEntity
        {
            Name = input.Name
        }, cancellation);

        return Result<ProductBrandCreateOutput>.Success(new ProductBrandCreateOutput
        {
            Id = created.Id,
            Name = created.Name
        });
    }

    public async Task<Result<ProductBrandUpdateOutput>> BrandUpdateAsync(int id, ProductBrandUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await productRepository.BrandGetAsync(id, cancellation);
        if (entity == null)
            return Result<ProductBrandUpdateOutput>.Failure("Product brand not found");

        entity.Name = input.Name;
        var updated = await productRepository.BrandUpdateAsync(entity, cancellation);
        return Result<ProductBrandUpdateOutput>.Success(new ProductBrandUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name
        });
    }

    public async Task<Result<bool>> BrandDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.BrandGetAsync(id, cancellation);
        if (entity == null)
            return Result<bool>.Failure("Product brand not found");

        if (entity.Products.Count != 0)
            return Result<bool>.Failure("Product brand is in use");

        await productRepository.BrandDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<List<ProductVariantListOutput>>> VariantListAsync(CancellationToken cancellation)
    {
        var entities = await productRepository.VariantListAsync(cancellation);
        var result = entities.Select(x => new ProductVariantListOutput
        {
            Id = x.Id,
            ColorName = x.ColorName,
            ColorCode = x.ColorCode
        }).ToList();
        return Result<List<ProductVariantListOutput>>.Success(result);
    }

    public async Task<Result<ProductVariantGetOutput?>> VariantGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.VariantGetAsync(id, cancellation);
        if (entity == null)
            return Result<ProductVariantGetOutput?>.Failure("Product variant not found");

        return Result<ProductVariantGetOutput?>.Success(new ProductVariantGetOutput
        {
            Id = entity.Id,
            ColorName = entity.ColorName,
            ColorCode = entity.ColorCode
        });
    }

    public async Task<Result<ProductVariantCreateOutput>> VariantCreateAsync(ProductVariantCreateInput input,
        CancellationToken cancellation)
    {
        var created = await productRepository.VariantCreateAsync(new ProductVariantEntity
        {
            ColorName = input.ColorName,
            ColorCode = input.ColorCode
        }, cancellation);

        return Result<ProductVariantCreateOutput>.Success(new ProductVariantCreateOutput
        {
            Id = created.Id,
            ColorName = created.ColorName,
            ColorCode = created.ColorCode
        });
    }

    public async Task<Result<ProductVariantUpdateOutput>> VariantUpdateAsync(int id, ProductVariantUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await productRepository.VariantGetAsync(id, cancellation);
        if (entity == null)
            return Result<ProductVariantUpdateOutput>.Failure("Product variant not found");

        entity.ColorName = input.ColorName;
        entity.ColorCode = input.ColorCode;
        var updated = await productRepository.VariantUpdateAsync(entity, cancellation);
        return Result<ProductVariantUpdateOutput>.Success(new ProductVariantUpdateOutput
        {
            Id = updated.Id,
            ColorName = updated.ColorName,
            ColorCode = updated.ColorCode
        });
    }

    public async Task<Result<bool>> VariantDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await productRepository.VariantGetAsync(id, cancellation);
        if (entity == null)
            return Result<bool>.Failure("Product variant not found");

        if (entity.Products.Count != 0)
            return Result<bool>.Failure("Product variant is in use");

        await productRepository.VariantDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<List<ProductBookmarkListOutput>>> BookmarkListAsync(int userId, CancellationToken cancellation)
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
                    Price = entity.Product.Price,
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
}

using Store.Domain.Categories;
using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Store.Domain.Sellers;
using Microsoft.Extensions.Configuration;

namespace Store.Service.EntityService;

public class ProductService(
    IProductRepository productRepository,
    ISellerRepository sellerRepository,
    ICategoryRepository categoryRepository,
    FileService fileService,
    IFileRepository fileRepository,
    IConfiguration configuration)
{
    public async Task<Result<ProductTorobOutput>> TorobListAsync(ProductTorobInput input,
        CancellationToken cancellation)
    {
        if (input.AdditionalData is { Count: > 0 })
            return Result<ProductTorobOutput>.Failure(
                $"{input.AdditionalData.Keys.First()} parameter is not supported");

        var hasPageUrls = input.PageUrls != null;
        var hasPageUniques = input.PageUniques != null;
        var hasPage = input.Page.HasValue;
        var hasCursor = input.Cursor != null;
        var isFirstCursorPage = !hasPageUrls && !hasPageUniques && !hasPage && !hasCursor && input.Sort != null;
        var modeCount = (hasPageUrls ? 1 : 0) + (hasPageUniques ? 1 : 0) +
                        (hasPage ? 1 : 0) + (hasCursor ? 1 : 0) + (isFirstCursorPage ? 1 : 0);
        if (modeCount != 1)
            return Result<ProductTorobOutput>.Failure(
                "provide exactly one of page_urls, page_uniques, page, or cursor pagination");

        var websiteUrl = configuration["Torob:WebsiteUrl"]?.TrimEnd('/');
        var imageUrl = configuration["Torob:ImageUrl"]?.TrimEnd('/');
        var imageBucket = configuration["Minio:Bucket"]?.Trim('/');
        if (string.IsNullOrWhiteSpace(websiteUrl) || string.IsNullOrWhiteSpace(imageUrl))
            return Result<ProductTorobOutput>.Failure("Torob website or image URL is not configured");
        imageBucket = string.IsNullOrWhiteSpace(imageBucket) ? "store" : imageBucket;

        string ProductUrl(int id) => $"{websiteUrl}/products/{id}";

        if (hasPageUrls || hasPageUniques)
        {
            if (input.Sort != null || input.Page.HasValue || input.Cursor != null)
                return Result<ProductTorobOutput>.Failure(
                    "lookup requests cannot contain page, sort, or cursor parameters");

            var values = hasPageUrls ? input.PageUrls! : input.PageUniques!;
            if (values.Count == 0 || values.Any(string.IsNullOrWhiteSpace))
                return Result<ProductTorobOutput>.Failure(
                    $"{(hasPageUrls ? "page_urls" : "page_uniques")} must be a non-empty array of strings");

            input.ProductIds = [];
            foreach (var value in values.Distinct())
            {
                var identifier = hasPageUrls ? value.TrimEnd('/').Split('/').Last() : value;
                if (!int.TryParse(identifier, out var id))
                    continue;
                if (hasPageUrls && !string.Equals(value.TrimEnd('/'), ProductUrl(id), StringComparison.OrdinalIgnoreCase))
                    continue;
                input.ProductIds.Add(id);
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(input.Sort))
                return Result<ProductTorobOutput>.Failure("sort parameter is not provided");

            if (hasPage)
            {
                if (input.Page < 1)
                    return Result<ProductTorobOutput>.Failure("page must be an integer greater than zero");
                if (input.Sort is not ("date_added_desc" or "date_updated_desc"))
                    return Result<ProductTorobOutput>.Failure(
                        "sort must be date_added_desc or date_updated_desc for page pagination");
            }
            else
            {
                if (input.Sort != "product_id_desc")
                    return Result<ProductTorobOutput>.Failure(
                        "sort must be product_id_desc for cursor pagination");
                if (hasCursor && (!int.TryParse(input.Cursor, out var cursorId) || cursorId < 1))
                    return Result<ProductTorobOutput>.Failure(
                        "cursor must be a positive integer encoded as a string");
                if (hasCursor)
                    input.CursorId = int.Parse(input.Cursor!);
            }
        }

        var entities = await productRepository.TorobListAsync(input, cancellation);
        var products = new List<ProductTorobItemOutput>();

        foreach (var entity in entities.Items)
        {
            var imageEntities = await fileRepository.ListAsync(
                TableNameEnum.Products,
                TargetNameEnum.ProductId,
                entity.Id,
                cancellation);
            var imageLinks = imageEntities
                .OrderByDescending(x => x.IsMain)
                .ThenBy(x => x.Id)
                .Select(x => $"{imageUrl}/{imageBucket}/{x.Url.TrimStart('/')}")
                .ToList();

            products.Add(new ProductTorobItemOutput
            {
                PageUnique = entity.Id.ToString(),
                PageUrl = ProductUrl(entity.Id),
                ProductGroupId = null,
                Title = entity.Name,
                Subtitle = null,
                CurrentPrice = (long)decimal.Truncate(GetDiscountedPrice(GetDisplayPrice(entity), entity.Discount)),
                OldPrice = entity.Discount > 0 ? (long)decimal.Truncate(GetDisplayPrice(entity)) : null,
                Availability = IsAvailable(entity),
                CategoryName = entity.Category.Name,
                ImageLinks = imageLinks,
                Spec = entity.ProductAttributes
                    .Where(x => !string.IsNullOrWhiteSpace(x.Attribute.Name))
                    .GroupBy(x => x.Attribute.Name)
                    .ToDictionary(x => x.Key, x => x.Last().Value),
                Guarantee = null,
                ShortDescription = entity.ShortDescription,
                DateAdded = FormatTorobDate(entity.CreatedAt),
                DateUpdated = FormatTorobDate(entity.UpdatedAt),
                SellerName = entity.Seller.Name,
                SellerCity = null
            });
        }

        return Result<ProductTorobOutput>.Success(new ProductTorobOutput
        {
            ApiVersion = "torob_api_v3",
            CurrentPage = entities.CurrentPage,
            Total = entities.TotalCount,
            MaxPages = entities.TotalCount.HasValue
                ? Math.Max(1, (int)Math.Ceiling(entities.TotalCount.Value / 100m))
                : null,
            NextCursor = entities.NextCursor,
            Products = products
        });
    }

    private static string FormatTorobDate(DateTime value)
    {
        var utcValue = value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
            : value.ToUniversalTime();
        return utcValue.ToString("O");
    }

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
                Price = GetDisplayPrice(entity),
                Discount = entity.Discount,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                IsAvailable = IsAvailable(entity),
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
                Price = GetDisplayPrice(entity),
                Discount = entity.Discount,
                AverageRating = ratings.Count != 0
                    ? ratings.Average(x => (decimal)x.Rating!.Value)
                    : 0,
                CategoryId = entity.CategoryId,
                CategoryTitle = entity.Category.Name,
                IsAvailable = IsAvailable(entity),
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
                Price = GetDisplayPrice(similarEntity),
                Discount = similarEntity.Discount,
                AverageRating = ratings.Count != 0
                    ? ratings.Average(x => (decimal)x.Rating!.Value)
                    : 0,
                CategoryId = similarEntity.CategoryId,
                CategoryTitle = similarEntity.Category.Name,
                IsAvailable = IsAvailable(similarEntity),
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
            Price = GetDisplayPrice(entity),
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            IsAvailable = IsAvailable(entity),
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
            Variants = entity.ProductVariants.Select(MapCombination).ToList(),
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
            Price = GetDisplayPrice(entity),
            Discount = entity.Discount,
            CategoryId = entity.CategoryId,
            CategoryTitle = entity.Category.Name,
            Brand = brand,
            IsAvailable = IsAvailable(entity),
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
            Variants = entity.ProductVariants.Select(MapCombination).ToList()
        };

        return Result<ProductGetOutput?>.Success(result);
    }

    public async Task<Result<ProductCreateOutput>> CreateAsync(int userId, ProductCreateInput input, CancellationToken cancellation)
    {
        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("Seller not found");

        if (await productRepository.BrandGetAsync(input.ProductBrandId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("Product brand not found");

        var combinations = input.Variants?.Select(x => new ProductCombinationData(
            null,
            x.Price,
            x.Stock,
            x.Values?.Select(value => new ProductVariantAttributeValueData(
                value.Size,
                value.Name,
                value.Code)).ToList() ?? [])).ToList() ?? [];
        var validationError = ValidateCombinations(combinations);
        if (validationError != null)
            return Result<ProductCreateOutput>.Failure(validationError);

        if (input.Discount < 0 || combinations.Any(x => input.Discount > x.Price))
            return Result<ProductCreateOutput>.Failure("Product discount is invalid");

        var entity = new ProductEntity
        {
            Name = input.Name,
            ShortDescription = input.ShortDescription,
            LongDescription = input.LongDescription,
            Discount = input.Discount,
            CategoryId = input.CategoryId,
            SellerId = input.SellerId,
            ProductBrandId = input.ProductBrandId,
            ProductAttributes = input.Attributes.Select(x => new ProductAttributeEntity
            {
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList(),
            ProductVariants = combinations.Select(x => new ProductVariantEntity
            {
                Price = x.Price,
                Stock = x.Stock,
                CombinationKey = CreateCombinationKey(x.Values),
                AttributeValues = x.Values.Select(value => new ProductVariantAttributeValueEntity
                {
                    Size = value.Size.Trim(),
                    Name = value.Name.Trim(),
                    Code = value.Code.Trim()
                }).ToList()
            }).ToList()
        };

        var created = await productRepository.CreateAsync(entity, cancellation);

        return Result<ProductCreateOutput>.Success(new ProductCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            ShortDescription = created.ShortDescription,
            LongDescription = created.LongDescription,
            Price = GetDisplayPrice(created),
            Discount = created.Discount,
            CategoryId = created.CategoryId,
            SellerId = created.SellerId,
            ProductBrandId = created.ProductBrandId,
            IsAvailable = IsAvailable(created),
            Attributes = created.ProductAttributes.Select(x => new ProductAttributeOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList(),
            Variants = created.ProductVariants.Select(MapCombination).ToList()
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

        var combinations = input.Variants?.Select(x => new ProductCombinationData(
            x.Id,
            x.Price,
            x.Stock,
            x.Values?.Select(value => new ProductVariantAttributeValueData(
                value.Size,
                value.Name,
                value.Code)).ToList() ?? [])).ToList() ?? [];
        var validationError = ValidateCombinations(combinations);
        if (validationError != null)
            return Result<ProductUpdateOutput>.Failure(validationError);

        if (input.Discount < 0 || combinations.Any(x => input.Discount > x.Price))
            return Result<ProductUpdateOutput>.Failure("Product discount is invalid");

        var inputIds = combinations.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).ToList();
        if (inputIds.Count != inputIds.Distinct().Count() ||
            inputIds.Any(inputId => entity.ProductVariants.All(x => x.Id != inputId)))
            return Result<ProductUpdateOutput>.Failure("Product variant is invalid");

        entity.Name = input.Name;
        entity.ShortDescription = input.ShortDescription;
        entity.LongDescription = input.LongDescription;
        entity.Discount = input.Discount;
        entity.CategoryId = input.CategoryId;
        entity.SellerId = input.SellerId;
        entity.ProductBrandId = input.ProductBrandId;

        foreach (var item in input.Attributes)
        {
            var attribute = entity.ProductAttributes.FirstOrDefault(x => x.AttributeId == item.AttributeId);

            if (attribute != null)
                attribute.Value = item.Value;
        }

        foreach (var existing in entity.ProductVariants.ToList())
        {
            var item = combinations.FirstOrDefault(x => x.Id == existing.Id);
            if (item == null)
            {
                if (await productRepository.ProductVariantIsInUseAsync(existing.Id, cancellation))
                    return Result<ProductUpdateOutput>.Failure("An in-use product variant cannot be removed");

                entity.ProductVariants.Remove(existing);
                continue;
            }

            var newKey = CreateCombinationKey(item.Values);
            if (newKey != existing.CombinationKey &&
                await productRepository.ProductVariantIsInUseAsync(existing.Id, cancellation))
                return Result<ProductUpdateOutput>.Failure("The values of an in-use product variant cannot be changed");

            existing.Price = item.Price;
            existing.Stock = item.Stock;
            existing.CombinationKey = newKey;
            existing.AttributeValues.Clear();
            foreach (var value in item.Values)
                existing.AttributeValues.Add(new ProductVariantAttributeValueEntity
                {
                    Size = value.Size.Trim(),
                    Name = value.Name.Trim(),
                    Code = value.Code.Trim()
                });
        }

        foreach (var item in combinations.Where(x => !x.Id.HasValue))
            entity.ProductVariants.Add(new ProductVariantEntity
            {
                Price = item.Price,
                Stock = item.Stock,
                CombinationKey = CreateCombinationKey(item.Values),
                AttributeValues = item.Values.Select(value => new ProductVariantAttributeValueEntity
                {
                    Size = value.Size.Trim(),
                    Name = value.Name.Trim(),
                    Code = value.Code.Trim()
                }).ToList()
            });

        var updated = await productRepository.UpdateAsync(entity, cancellation);
        if (updated == null)
            return Result<ProductUpdateOutput>.Failure("Product variant stock changed; reload the product and try again");

        return Result<ProductUpdateOutput>.Success(new ProductUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            ShortDescription = updated.ShortDescription,
            LongDescription = updated.LongDescription,
            Price = GetDisplayPrice(updated),
            Discount = updated.Discount,
            CategoryId = updated.CategoryId,
            CategoryTitle = updated.Category.Name,
            SellerId = updated.SellerId,
            ProductBrandId = updated.ProductBrandId,
            IsAvailable = IsAvailable(updated),
            Attributes = updated.ProductAttributes.Select(x => new ProductAttributeUpdateOutput
            {
                Id = x.Id,
                AttributeId = x.AttributeId,
                Value = x.Value
            }).ToList(),
            Variants = updated.ProductVariants.Select(MapCombination).ToList()
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

    private static string? ValidateCombinations(List<ProductCombinationData> combinations)
    {
        if (combinations.Count == 0)
            return "At least one product variant is required";

        if (combinations.Any(x => x.Price < 0))
            return "Product variant price cannot be negative";

        if (combinations.Any(x => x.Stock < 0))
            return "Product variant stock cannot be negative";

        if (combinations.Any(x => x.Values.Count == 0 || x.Values.Any(value =>
                string.IsNullOrWhiteSpace(value.Size) || value.Size.Trim().Length > 50 ||
                string.IsNullOrWhiteSpace(value.Name) || value.Name.Trim().Length > 100 ||
                string.IsNullOrWhiteSpace(value.Code) || value.Code.Trim().Length > 32)))
            return "Product variant values are invalid";

        if (combinations.Any(combination => combination.Values
                .Select(value => value.Size.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count() != combination.Values.Count))
            return "A product variant cannot contain multiple values of the same type";

        var keys = combinations.Select(x => CreateCombinationKey(x.Values)).ToList();
        if (keys.Any(x => x.Length > 500))
            return "Product variant combination is too long";

        if (keys.Count != keys.Distinct(StringComparer.Ordinal).Count())
            return "Duplicate product variant combination";

        return null;
    }

    private static string CreateCombinationKey(IEnumerable<ProductVariantAttributeValueData> values) =>
        string.Join("\u001e", values
            .Select(value => string.Join("\u001f",
                value.Size.Trim().ToLowerInvariant(),
                value.Name.Trim().ToLowerInvariant(),
                value.Code.Trim().ToLowerInvariant()))
            .OrderBy(value => value, StringComparer.Ordinal));

    private static decimal GetDisplayPrice(ProductEntity product)
    {
        var availablePrices = product.ProductVariants.Where(x => x.Stock > 0).Select(x => x.Price).ToList();
        return availablePrices.Count > 0
            ? availablePrices.Min()
            : product.ProductVariants.Select(x => x.Price).DefaultIfEmpty(0).Min();
    }

    private static decimal GetDiscountedPrice(decimal price, decimal discount) => Math.Max(0, price - discount);

    private static bool IsAvailable(ProductEntity product) => product.ProductVariants.Any(x => x.Stock > 0);

    private static ProductCombinationOutput MapCombination(ProductVariantEntity combination) => new()
    {
        Id = combination.Id,
        Price = combination.Price,
        Stock = combination.Stock,
        Values = combination.AttributeValues
            .OrderBy(x => x.Size)
            .ThenBy(x => x.Id)
            .Select(x => new ProductVariantAttributeValueOutput
            {
                Id = x.Id,
                Size = x.Size,
                Name = x.Name,
                Code = x.Code
            }).ToList()
    };

    private sealed record ProductCombinationData(
        int? Id,
        decimal Price,
        int Stock,
        List<ProductVariantAttributeValueData> Values);

    private sealed record ProductVariantAttributeValueData(string Size, string Name, string Code);
}

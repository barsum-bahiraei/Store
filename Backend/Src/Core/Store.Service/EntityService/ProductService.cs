using Store.Domain.Categories;
using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Products.Models.Input;
using Store.Domain.Products.Models.Output;
using Store.Domain.Sellers;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace Store.Service.EntityService;

public class ProductService(
    IProductRepository productRepository,
    ISellerRepository sellerRepository,
    ICategoryRepository categoryRepository,
    FileService fileService,
    IFileRepository fileRepository,
    IConfiguration configuration)
{
    private readonly BrandService brandService = new(productRepository, fileService);
    private readonly ProductInteractionService productInteractionService = new(productRepository, fileService);

    public async Task<Result<ProductTorobOutput>> TorobListAsync(ProductTorobInput input,
        CancellationToken cancellation)
    {
        if (input.AdditionalData is { Count: > 0 })
            return Result<ProductTorobOutput>.Failure(
                $"پارامتر «{input.AdditionalData.Keys.First()}» پشتیبانی نمی‌شود");

        var hasPageUrls = input.PageUrls != null;
        var hasPageUniques = input.PageUniques != null;
        var hasPage = input.Page.HasValue;
        var hasCursor = input.Cursor != null;
        var isFirstCursorPage = !hasPageUrls && !hasPageUniques && !hasPage && !hasCursor && input.Sort != null;
        var modeCount = (hasPageUrls ? 1 : 0) + (hasPageUniques ? 1 : 0) +
                        (hasPage ? 1 : 0) + (hasCursor ? 1 : 0) + (isFirstCursorPage ? 1 : 0);
        if (modeCount != 1)
            return Result<ProductTorobOutput>.Failure(
                "برای صفحه‌بندی دقیقاً یکی از page_urls، page_uniques، page یا cursor را ارسال کنید");

        var websiteUrl = configuration["Torob:WebsiteUrl"]?.TrimEnd('/');
        var imageUrl = configuration["Torob:ImageUrl"]?.TrimEnd('/');
        var imageBucket = configuration["Minio:Bucket"]?.Trim('/');
        if (string.IsNullOrWhiteSpace(websiteUrl) || string.IsNullOrWhiteSpace(imageUrl))
            return Result<ProductTorobOutput>.Failure("نشانی وب‌سایت یا تصویر ترب پیکربندی نشده است");
        imageBucket = string.IsNullOrWhiteSpace(imageBucket) ? "store" : imageBucket;

        string ProductUrl(int id) => $"{websiteUrl}/products/{id}";

        if (hasPageUrls || hasPageUniques)
        {
            if (input.Sort != null || input.Page.HasValue || input.Cursor != null)
                return Result<ProductTorobOutput>.Failure(
                    "درخواست جست‌وجوی مستقیم نمی‌تواند شامل پارامترهای page، sort یا cursor باشد");

            var values = hasPageUrls ? input.PageUrls! : input.PageUniques!;
            if (values.Count == 0 || values.Any(string.IsNullOrWhiteSpace))
                return Result<ProductTorobOutput>.Failure(
                    $"{(hasPageUrls ? "page_urls" : "page_uniques")} باید آرایه‌ای غیرخالی از رشته‌ها باشد");

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
                return Result<ProductTorobOutput>.Failure("پارامتر sort ارسال نشده است");

            if (hasPage)
            {
                if (input.Page < 1)
                    return Result<ProductTorobOutput>.Failure("page باید عددی صحیح و بزرگ‌تر از صفر باشد");
                if (input.Sort is not ("date_added_desc" or "date_updated_desc"))
                    return Result<ProductTorobOutput>.Failure(
                        "برای صفحه‌بندی مبتنی بر page، مقدار sort باید date_added_desc یا date_updated_desc باشد");
            }
            else
            {
                if (input.Sort != "product_id_desc")
                    return Result<ProductTorobOutput>.Failure(
                        "برای صفحه‌بندی مبتنی بر cursor، مقدار sort باید product_id_desc باشد");
                if (hasCursor && (!int.TryParse(input.Cursor, out var cursorId) || cursorId < 1))
                    return Result<ProductTorobOutput>.Failure(
                        "cursor باید عدد صحیح مثبتی باشد که به‌صورت رشته ارسال شده است");
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

    public async Task<Result<ProductListPageOutput>> ListAsync(int userId, ProductListInput input,
        CancellationToken cancellation)
    {
        var entities = await productRepository.ListAsync(userId, input, cancellation);
        var images = await fileService.MainListAsync(
            TableNameEnum.Products,
            TargetNameEnum.ProductId,
            entities.Items.Select(x => x.Id).ToList(),
            cancellation);

        foreach (var item in entities.Items)
        {
            if (images.TryGetValue(item.Id, out var image))
            {
                item.Image = new ProductImageListOutput
                {
                    Id = image.Id,
                    Url = image.Url,
                    IsMain = image.IsMain,
                    Name = image.Name,
                    FileType = image.FileType
                };
            }
        }

        var pageResult = new ProductListPageOutput
        {
            TotalCount = entities.TotalCount,
            Items = entities.Items
        };
        return Result<ProductListPageOutput>.Success(pageResult);
    }

    public async Task<Result<ProductPricePercentageUpdateOutput>> UpdatePricesByPercentageAsync(int userId,
        ProductPricePercentageUpdateInput input, CancellationToken cancellation)
    {
        if (input.Percentage is < 1 or > 100)
            return Result<ProductPricePercentageUpdateOutput>.Failure("درصد باید عددی بین ۱ تا ۱۰۰ باشد");
        if (!input.IsIncrease.HasValue)
            return Result<ProductPricePercentageUpdateOutput>.Failure("نوع تغییر قیمت باید مشخص شود");
        if (input.ExpectedProductCount < 1)
            return Result<ProductPricePercentageUpdateOutput>.Failure("تعداد محصولات انتخاب‌شده نامعتبر است");

        var updated = await productRepository.UpdatePricesByPercentageAsync(userId, input, cancellation);
        if (!updated.IsCountMatch)
            return Result<ProductPricePercentageUpdateOutput>.Failure(
                $"تعداد محصولات از {input.ExpectedProductCount} به {updated.ProductCount} تغییر کرده است؛ فهرست را به‌روزرسانی و دوباره تلاش کنید");

        return Result<ProductPricePercentageUpdateOutput>.Success(new ProductPricePercentageUpdateOutput
        {
            ProductCount = updated.ProductCount,
            VariantCount = updated.VariantCount
        });
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
            return Result<ProductDetailOutput?>.Failure("محصول یافت نشد");

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
        ProductCommentCreateInput input, CancellationToken cancellation) =>
        await productInteractionService.CommentCreateAsync(productId, userId, input, cancellation);

    public async Task<Result<ProductGetOutput?>> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await productRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<ProductGetOutput?>.Failure("محصول یافت نشد");

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
            return Result<ProductCreateOutput>.Failure("فروشنده یافت نشد");

        if (input.ProductBrandId is { } createBrandId &&
            await productRepository.BrandGetAsync(createBrandId, cancellation) == null)
            return Result<ProductCreateOutput>.Failure("برند محصول یافت نشد");

        var combinations = input.Variants?.Select(x => new ProductCombinationData(
            null,
            x.Price,
            x.Stock,
            x.Values?.Select(value => new ProductVariantAttributeValueData(
                value.Size,
                value.Model,
                value.ColorName,
                value.ColorCode)).ToList() ?? [])).ToList() ?? [];
        var validationError = ValidateCombinations(combinations);
        if (validationError != null)
            return Result<ProductCreateOutput>.Failure(validationError);

        if (input.Discount < 0 || combinations.Any(x => input.Discount > x.Price))
            return Result<ProductCreateOutput>.Failure("تخفیف محصول نامعتبر است");

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
                    Size = NormalizeOptional(value.Size),
                    Model = NormalizeOptional(value.Model),
                    ColorName = value.ColorName.Trim(),
                    ColorCode = value.ColorCode.Trim()
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
            return Result<ProductUpdateOutput>.Failure("محصول یافت نشد");

        if (await sellerRepository.GetAsync(input.SellerId, userId, cancellation) == null)
            return Result<ProductUpdateOutput>.Failure("فروشنده یافت نشد");

        if (input.ProductBrandId is { } updateBrandId &&
            await productRepository.BrandGetAsync(updateBrandId, cancellation) == null)
            return Result<ProductUpdateOutput>.Failure("برند محصول یافت نشد");

        var combinations = input.Variants?.Select(x => new ProductCombinationData(
            x.Id,
            x.Price,
            x.Stock,
            x.Values?.Select(value => new ProductVariantAttributeValueData(
                value.Size,
                value.Model,
                value.ColorName,
                value.ColorCode)).ToList() ?? [])).ToList() ?? [];
        var validationError = ValidateCombinations(combinations);
        if (validationError != null)
            return Result<ProductUpdateOutput>.Failure(validationError);

        if (input.Discount < 0 || combinations.Any(x => input.Discount > x.Price))
            return Result<ProductUpdateOutput>.Failure("تخفیف محصول نامعتبر است");

        var inputIds = combinations.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).ToList();
        if (inputIds.Count != inputIds.Distinct().Count() ||
            inputIds.Any(inputId => entity.ProductVariants.All(x => x.Id != inputId)))
            return Result<ProductUpdateOutput>.Failure("تنوع محصول نامعتبر است");

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
                    return Result<ProductUpdateOutput>.Failure("تنوع محصولی که در حال استفاده است قابل حذف نیست");

                entity.ProductVariants.Remove(existing);
                continue;
            }

            var newKey = CreateCombinationKey(item.Values);

            existing.Price = item.Price;
            existing.Stock = item.Stock;
            existing.CombinationKey = newKey;
            existing.AttributeValues.Clear();
            foreach (var value in item.Values)
                existing.AttributeValues.Add(new ProductVariantAttributeValueEntity
                {
                    Size = NormalizeOptional(value.Size),
                    Model = NormalizeOptional(value.Model),
                    ColorName = value.ColorName.Trim(),
                    ColorCode = value.ColorCode.Trim()
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
                    Size = NormalizeOptional(value.Size),
                    Model = NormalizeOptional(value.Model),
                    ColorName = value.ColorName.Trim(),
                    ColorCode = value.ColorCode.Trim()
                }).ToList()
            });

        var updated = await productRepository.UpdateAsync(entity, cancellation);
        if (updated == null)
            return Result<ProductUpdateOutput>.Failure("موجودی تنوع محصول تغییر کرده است؛ محصول را دوباره بارگذاری و مجدداً تلاش کنید");

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
            return Result<bool>.Failure("محصول یافت نشد");

        await productRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }

    public async Task<Result<List<ProductBrandListOutput>>> BrandListAsync(CancellationToken cancellation) =>
        await brandService.BrandListAsync(cancellation);

    public async Task<Result<ProductBrandGetOutput?>> BrandGetAsync(int id, CancellationToken cancellation) =>
        await brandService.BrandGetAsync(id, cancellation);

    public async Task<Result<ProductBrandCreateOutput>> BrandCreateAsync(ProductBrandCreateInput input,
        CancellationToken cancellation) => await brandService.BrandCreateAsync(input, cancellation);

    public async Task<Result<ProductBrandUpdateOutput>> BrandUpdateAsync(int id, ProductBrandUpdateInput input,
        CancellationToken cancellation) => await brandService.BrandUpdateAsync(id, input, cancellation);

    public async Task<Result<bool>> BrandDeleteAsync(int id, CancellationToken cancellation) =>
        await brandService.BrandDeleteAsync(id, cancellation);

    public async Task<Result<List<ProductBookmarkListOutput>>> BookmarkListAsync(int userId,
        CancellationToken cancellation) => await productInteractionService.BookmarkListAsync(userId, cancellation);

    public async Task<Result<bool>> BookmarkCreateAsync(int productId, int userId, CancellationToken cancellation) =>
        await productInteractionService.BookmarkCreateAsync(productId, userId, cancellation);

    public async Task<Result<bool>> BookmarkDeleteAsync(int productId, int userId, CancellationToken cancellation) =>
        await productInteractionService.BookmarkDeleteAsync(productId, userId, cancellation);

    private static string? ValidateCombinations(List<ProductCombinationData> combinations)
    {
        if (combinations.Count == 0)
            return "حداقل یک تنوع محصول الزامی است";

        if (combinations.Any(x => x.Price < 0))
            return "قیمت تنوع محصول نمی‌تواند منفی باشد";

        if (combinations.Any(x => x.Stock < 0))
            return "موجودی تنوع محصول نمی‌تواند منفی باشد";

        if (combinations.Any(x => x.Values.Count == 0 || x.Values.Any(value =>
                NormalizeOptional(value.Size)?.Length > 50 ||
                NormalizeOptional(value.Model)?.Length > 100 ||
                string.IsNullOrWhiteSpace(value.ColorName) || value.ColorName.Trim().Length > 100 ||
                string.IsNullOrWhiteSpace(value.ColorCode) || value.ColorCode.Trim().Length > 32 ||
                !Regex.IsMatch(value.ColorCode.Trim(), "^#[0-9a-fA-F]{6}$"))))
            return "مقادیر تنوع محصول نامعتبر هستند";

        if (combinations.Any(combination => combination.Values
                .Select(CreateCombinationValueKey)
                .Distinct(StringComparer.Ordinal)
                .Count() != combination.Values.Count))
            return "یک تنوع محصول نمی‌تواند مقدار تکراری داشته باشد";

        var keys = combinations.Select(x => CreateCombinationKey(x.Values)).ToList();
        if (keys.Any(x => x.Length > 500))
            return "ترکیب تنوع محصول بیش از حد طولانی است";

        if (keys.Count != keys.Distinct(StringComparer.Ordinal).Count())
            return "ترکیب تنوع محصول تکراری است";

        return null;
    }

    private static string CreateCombinationKey(IEnumerable<ProductVariantAttributeValueData> values) =>
        string.Join("\u001e", values
            .Select(CreateCombinationValueKey)
            .OrderBy(value => value, StringComparer.Ordinal));

    private static string CreateCombinationValueKey(ProductVariantAttributeValueData value)
    {
        var parts = new List<string>
        {
            NormalizeOptional(value.Size)?.ToLowerInvariant() ?? string.Empty,
            value.ColorName.Trim().ToLowerInvariant(),
            value.ColorCode.Trim().ToLowerInvariant()
        };
        var model = NormalizeOptional(value.Model);
        if (model != null)
            parts.Add(model.ToLowerInvariant());
        return string.Join("\u001f", parts);
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

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
                Model = x.Model,
                ColorName = x.ColorName,
                ColorCode = x.ColorCode
            }).ToList()
    };

    private sealed record ProductCombinationData(
        int? Id,
        decimal Price,
        int Stock,
        List<ProductVariantAttributeValueData> Values);

    private sealed record ProductVariantAttributeValueData(
        string? Size,
        string? Model,
        string ColorName,
        string ColorCode);
}

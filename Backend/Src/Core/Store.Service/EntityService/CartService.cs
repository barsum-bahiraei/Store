using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Invoices.Models.Input;
using Store.Domain.Invoices.Models.Output;
using Store.Domain.Products;

namespace Store.Service.EntityService;

internal class CartService(
    IInvoiceRepository invoiceRepository,
    IProductRepository productRepository,
    FileService fileService)
{
    public async Task<Result<List<CartListOutput>>> CartListAsync(int userId,
        CancellationToken cancellation)
    {
        var entities = await invoiceRepository.CartListAsync(userId, cancellation);
        var result = new List<CartListOutput>();
        foreach (var entity in entities)
        {
            var imageResult =
                await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, entity.Product.Id,
                    cancellation);
            CartProductImageListOutput? image = null;
            if (imageResult.Data != null)
            {
                image = new CartProductImageListOutput
                {
                    Id = imageResult.Data.Id,
                    Name = imageResult.Data.Name,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    FileType = imageResult.Data.FileType,
                };
            }

            result.Add(new CartListOutput
            {
                Id = entity.Id,
                ProductCount = entity.ProductCount,
                ProductVariantId = entity.ProductVariantId,
                Variant = MapCartVariant(entity.ProductVariant),
                Product = new CartProductListOutput
                {
                    Id = entity.Product.Id,
                    Name = entity.Product.Name,
                    Price = entity.ProductVariant.Price,
                    Discount = entity.Product.Discount,
                    Image = image,
                }
            });
        }

        return Result<List<CartListOutput>>.Success(result);
    }

    public async Task<Result<CartCreateOutput>> CartCreateAsync(int userId, CartCreateInput input,
        CancellationToken cancellation)
    {
        if (input.ProductCount <= 0)
            return Result<CartCreateOutput>.Failure("Product count must be greater than zero");

        var product = await productRepository.GetAsync(input.ProductId, cancellation);
        if (product == null)
            return Result<CartCreateOutput>.Failure("Product not found");

        var productVariant = product.ProductVariants.FirstOrDefault(x => x.Id == input.ProductVariantId);
        if (productVariant == null)
            return Result<CartCreateOutput>.Failure("Product variant is invalid");

        if (productVariant.Stock < input.ProductCount)
            return Result<CartCreateOutput>.Failure("Product variant stock is insufficient");

        var created = await invoiceRepository.CartAddAsync(new CartEntity
        {
            UserId = userId,
            ProductId = input.ProductId,
            ProductVariantId = input.ProductVariantId,
            ProductCount = input.ProductCount,
        }, cancellation);
        if (created == null)
            return Result<CartCreateOutput>.Failure("Product variant stock is insufficient");
        var imageResult =
            await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, created.Product.Id,
                cancellation);
        CartProductImageCreateOutput? image = null;
        if (imageResult.Data != null)
        {
            image = new CartProductImageCreateOutput
            {
                Id = imageResult.Data.Id,
                Name = imageResult.Data.Name,
                Url = imageResult.Data.Url,
                IsMain = imageResult.Data.IsMain,
                FileType = imageResult.Data.FileType,
            };
        }

        var result = new CartCreateOutput
        {
            Id = created.Id,
            ProductCount = created.ProductCount,
            ProductVariantId = created.ProductVariantId,
            Variant = MapCartVariant(created.ProductVariant),
            Product = new CartProductCreateOutput
            {
                Id = created.Product.Id,
                Name = created.Product.Name,
                Price = created.ProductVariant.Price,
                Discount = created.Product.Discount,
                Image = image,
            }
        };
        return Result<CartCreateOutput>.Success(result);
    }

    public async Task<Result<CartUpdateOutput>> CartUpdateAsync(int id, int userId, CartUpdateInput input,
        CancellationToken cancellation)
    {
        if (input.ProductCount <= 0)
            return Result<CartUpdateOutput>.Failure("Product count must be greater than zero");

        var entity = await invoiceRepository.CartGetAsync(id, userId, cancellation);
        if (entity == null)
            return Result<CartUpdateOutput>.Failure("Cart not found");

        if (entity.ProductVariant.ProductId != entity.ProductId)
            return Result<CartUpdateOutput>.Failure("Product variant is invalid");

        if (entity.ProductVariant.Stock < input.ProductCount)
            return Result<CartUpdateOutput>.Failure("Product variant stock is insufficient");

        entity.ProductCount = input.ProductCount;

        var updated = await invoiceRepository.CartUpdateAsync(entity, cancellation);
        var imageResult =
            await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, updated.Product.Id,
                cancellation);
        CartProductImageUpdateOutput? image = null;
        if (imageResult.Data != null)
        {
            image = new CartProductImageUpdateOutput
            {
                Id = imageResult.Data.Id,
                Name = imageResult.Data.Name,
                Url = imageResult.Data.Url,
                IsMain = imageResult.Data.IsMain,
                FileType = imageResult.Data.FileType,
            };
        }

        var result = new CartUpdateOutput
        {
            Id = updated.Id,
            ProductCount = updated.ProductCount,
            ProductVariantId = updated.ProductVariantId,
            Variant = MapCartVariant(updated.ProductVariant),
            Product = new CartProductUpdateOutput
            {
                Id = updated.Product.Id,
                Name = updated.Product.Name,
                Price = updated.ProductVariant.Price,
                Discount = updated.Product.Discount,
                Image = image,
            }
        };
        return Result<CartUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> CartDeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await invoiceRepository.CartGetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<bool>.Failure("Cart not found");

        await invoiceRepository.CartDeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }

    private static CartProductVariantOutput MapCartVariant(ProductVariantEntity variant) => new()
    {
        Id = variant.Id,
        Price = variant.Price,
        Stock = variant.Stock,
        Values = variant.AttributeValues
            .OrderBy(x => x.Size)
            .ThenBy(x => x.Id)
            .Select(x => new CartVariantValueOutput
            {
                Id = x.Id,
                Size = x.Size,
                ColorName = x.ColorName,
                ColorCode = x.ColorCode
            }).ToList()
    };
}

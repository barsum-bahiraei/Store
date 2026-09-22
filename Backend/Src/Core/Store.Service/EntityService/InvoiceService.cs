using Store.Domain.Accounts;
using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Invoices.Models.Input;
using Store.Domain.Invoices.Models.Output;
using Store.Domain.Products;

namespace Store.Service.EntityService;

public class InvoiceService(
    IInvoiceRepository invoiceRepository,
    IAccountRepository accountRepository,
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
                Product = new CartProductListOutput
                {
                    Id = entity.Product.Id,
                    Name = entity.Product.Name,
                    Price = entity.Product.Price,
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

        if (!product.IsAvailable)
            return Result<CartCreateOutput>.Failure("Product is not available");

        if (product.ProductVariants.All(x => x.Id != input.ProductVariantId))
            return Result<CartCreateOutput>.Failure("Product variant is invalid");

        var entity = new CartEntity
        {
            UserId = userId,
            ProductId = input.ProductId,
            ProductVariantId = input.ProductVariantId,
            ProductCount = input.ProductCount,
        };
        var created = await invoiceRepository.CartCreateAsync(entity, cancellation);
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
            Product = new CartProductCreateOutput
            {
                Id = created.Product.Id,
                Name = created.Product.Name,
                Price = created.Product.Price,
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
            Product = new CartProductUpdateOutput
            {
                Id = updated.Product.Id,
                Name = updated.Product.Name,
                Price = updated.Product.Price,
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

    public async Task<Result<List<InvoiceListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await invoiceRepository.ListAsync(userId, cancellation);
        var result = entities.Select(x => new InvoiceListOutput
            {
                Id = x.Id,
                TotalPrice = x.Payments.OrderBy(payment => payment.Id).FirstOrDefault()?.Amount
                             ?? x.InvoiceItems.Sum(item => item.ProductPrice * item.ProductCount),
                TotalCount = x.InvoiceItems.Sum(item => item.ProductCount),
                CreatedAt = x.CreatedAt,
                Address = x.User.Address!,
                PaymentMethod = x.PaymentMethod,
                DeliveryMethod = x.DeliveryMethod,
            }).ToList();
        return Result<List<InvoiceListOutput>>.Success(result);
    }

    public async Task<Result<CheckoutOutput>> CheckoutAsync(int userId, CheckoutInput input,
        CancellationToken cancellation)
    {
        if (!Enum.IsDefined(input.PaymentMethod))
            return Result<CheckoutOutput>.Failure("Payment method is invalid");

        if (!Enum.IsDefined(input.DeliveryMethod))
            return Result<CheckoutOutput>.Failure("Delivery method is invalid");

        if (input.DeliveryMethod == DeliveryMethodEnum.Delivery)
        {
            var user = await accountRepository.UserGetAsync(userId, cancellation);
            if (user == null)
                return Result<CheckoutOutput>.Failure("User not found");

            if (string.IsNullOrWhiteSpace(user.Address) ||
                !user.Latitude.HasValue ||
                !user.Longitude.HasValue)
                return Result<CheckoutOutput>.Failure("Delivery address must be completed");
        }

        var carts = await invoiceRepository.CartListAsync(userId, cancellation);
        if (carts.Count == 0)
            return Result<CheckoutOutput>.Failure("Cart is empty");

        if (carts.Any(x => x.ProductCount <= 0))
            return Result<CheckoutOutput>.Failure("Cart contains an invalid product count");

        if (carts.Any(x => !x.Product.IsAvailable))
            return Result<CheckoutOutput>.Failure("Cart contains an unavailable product");

        if (carts.Any(x => x.Product.Price < 0))
            return Result<CheckoutOutput>.Failure("Cart contains an invalid product price");

        if (carts.Any(x => x.ProductVariants.ProductId != x.ProductId))
            return Result<CheckoutOutput>.Failure("Cart contains an invalid product variant");

        var subtotal = carts.Sum(x => x.Product.Price * x.ProductCount);
        decimal discountAmount = 0;
        int? discountCodeId = null;

        if (input.DiscountCode != null)
        {
            var code = input.DiscountCode.Trim();
            if (code.Length == 0)
                return Result<CheckoutOutput>.Failure("Discount code is invalid");

            var userDiscountCode = await invoiceRepository.UserDiscountCodeGetAsync(userId, code, cancellation);
            if (userDiscountCode == null)
                return Result<CheckoutOutput>.Failure("Discount code is invalid for this user");

            var discountCode = userDiscountCode.DiscountCode;
            var now = DateTime.UtcNow;
            if (!discountCode.IsActive || userDiscountCode.IsUsed ||
                discountCode.StartDate.HasValue && discountCode.StartDate.Value > now ||
                discountCode.EndDate.HasValue && discountCode.EndDate.Value < now ||
                discountCode.PaymentMethod.HasValue && discountCode.PaymentMethod.Value != input.PaymentMethod ||
                discountCode.DiscountPercent is <= 0 or > 100 ||
                discountCode.MaxDiscountAmount is < 0)
                return Result<CheckoutOutput>.Failure("Discount code is not valid");

            discountAmount = decimal.Round(subtotal * discountCode.DiscountPercent / 100m, 2,
                MidpointRounding.AwayFromZero);
            if (discountCode.MaxDiscountAmount.HasValue)
                discountAmount = Math.Min(discountAmount, discountCode.MaxDiscountAmount.Value);

            discountCodeId = discountCode.Id;
        }

        var amount = subtotal - discountAmount;
        var invoice = new InvoiceEntity
        {
            UserId = userId,
            PaymentMethod = input.PaymentMethod,
            DeliveryMethod = input.DeliveryMethod,
            PaymentStatus = PaymentStatusEnum.New,
            DiscountCodeId = discountCodeId,
            InvoiceItems = carts.Select(x => new InvoiceItemEntity
            {
                ProductId = x.ProductId,
                ProductVariantId = x.ProductVariantId,
                ProductCount = x.ProductCount,
                ProductPrice = x.Product.Price
            }).ToList()
        };
        var payment = new PaymentEntity
        {
            Amount = amount,
            PaymentMethod = input.PaymentMethod,
            PaymentStatus = PaymentStatusEnum.New,
            Invoice = invoice
        };

        var created = await invoiceRepository.CheckoutCreateAsync(invoice, payment, carts, cancellation);
        return Result<CheckoutOutput>.Success(new CheckoutOutput
        {
            InvoiceId = created.Invoice.Id,
            PaymentId = created.Payment.Id,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            Amount = created.Payment.Amount,
            PaymentStatus = created.Payment.PaymentStatus
        });
    }

}

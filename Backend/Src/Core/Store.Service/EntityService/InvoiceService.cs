using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Store.Domain.Accounts;
using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Invoices.Models.Input;
using Store.Domain.Invoices.Models.Output;
using Store.Domain.Products;
using Store.Service.ProviderService;

namespace Store.Service.EntityService;

public class InvoiceService(
    IInvoiceRepository invoiceRepository,
    IAccountRepository accountRepository,
    IProductRepository productRepository,
    FileService fileService,
    MellatPaymentService mellatPaymentService,
    IConfiguration configuration,
    ILogger<InvoiceService> logger)
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

    public async Task<Result<List<InvoiceListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await invoiceRepository.ListAsync(userId, cancellation);
        var now = DateTime.UtcNow;
        var result = entities.Select(x => new InvoiceListOutput
            {
                Id = x.Id,
                TotalPrice = x.Payments.OrderBy(payment => payment.Id).FirstOrDefault()?.Amount
                             ?? x.InvoiceItems.Sum(item => item.ProductPrice * item.ProductCount),
                TotalCount = x.InvoiceItems.Sum(item => item.ProductCount),
                CreatedAt = x.CreatedAt,
                ExpiresAt = x.ExpiresAt,
                Address = x.User.Address!,
                PaymentMethod = x.PaymentMethod,
                DeliveryMethod = x.DeliveryMethod,
                PaymentStatus = x.PaymentStatus,
                CanRetryPayment = x.PaymentStatus is PaymentStatusEnum.Failed or PaymentStatusEnum.Cancelled &&
                                  x.ExpiresAt.HasValue && x.ExpiresAt.Value > now,
            }).ToList();
        return Result<List<InvoiceListOutput>>.Success(result);
    }

    public async Task<Result<CheckoutOutput>> CheckoutAsync(int userId, CheckoutInput input,
        CancellationToken cancellation)
    {
        if (!Enum.IsDefined(input.PaymentMethod))
            return Result<CheckoutOutput>.Failure("Payment method is invalid");

        if (input.PaymentMethod != PaymentMethodEnum.Online)
            return Result<CheckoutOutput>.Failure("Only online payment is currently available");

        if (!Enum.IsDefined(input.DeliveryMethod))
            return Result<CheckoutOutput>.Failure("Delivery method is invalid");

        if (input.DeliveryMethod != DeliveryMethodEnum.Pickup)
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

        if (carts.Any(x => x.ProductVariant.Price < 0))
            return Result<CheckoutOutput>.Failure("Cart contains an invalid product price");

        if (carts.Any(x => x.ProductVariant.ProductId != x.ProductId))
            return Result<CheckoutOutput>.Failure("Cart contains an invalid product variant");

        if (carts.Any(x => x.ProductVariant.Stock < x.ProductCount))
            return Result<CheckoutOutput>.Failure("Cart contains a product variant with insufficient stock");

        var subtotal = carts.Sum(x => GetUnitPrice(x.ProductVariant, x.Product) * x.ProductCount);
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
                discountCode.ExpireAt.HasValue && discountCode.ExpireAt.Value < now ||
                discountCode.PaymentMethod.HasValue && discountCode.PaymentMethod.Value != input.PaymentMethod ||
                discountCode.MaxDiscountAmount <= 0 ||
                discountCode.MinimumPurchaseAmount < 0 ||
                subtotal < discountCode.MinimumPurchaseAmount)
                return Result<CheckoutOutput>.Failure("Discount code is not valid");

            discountAmount = discountCode.MaxDiscountAmount;

            discountCodeId = discountCode.Id;
        }

        var amount = subtotal - discountAmount;
        var amountInRials = amount * 10m;
        if (amount <= 0 || amountInRials != decimal.Truncate(amountInRials) || amountInRials > long.MaxValue)
            return Result<CheckoutOutput>.Failure("Payment amount is invalid");

        MellatPaymentOptions mellatSettings;
        try
        {
            mellatSettings = mellatPaymentService.Settings;
        }
        catch (InvalidOperationException exception)
        {
            logger.LogError(exception, "Mellat payment configuration is invalid");
            return Result<CheckoutOutput>.Failure("Online payment is not available");
        }

        var invoice = new InvoiceEntity
        {
            UserId = userId,
            PaymentMethod = input.PaymentMethod,
            DeliveryMethod = input.DeliveryMethod,
            PaymentStatus = PaymentStatusEnum.New,
            ExpiresAt = DateTime.UtcNow.AddHours(
                Math.Max(1, configuration.GetValue("Invoice:PaymentRetryHours", 12))),
            DiscountCodeId = discountCodeId,
            InvoiceItems = carts.Select(x => new InvoiceItemEntity
            {
                ProductId = x.ProductId,
                ProductVariantId = x.ProductVariantId,
                ProductCount = x.ProductCount,
                ProductPrice = GetUnitPrice(x.ProductVariant, x.Product)
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
        created.Payment.OrderId = created.Payment.Id;
        await invoiceRepository.SavePaymentAsync(created.Payment, cancellation);

        MellatPayResponse payResponse;
        try
        {
            payResponse = await mellatPaymentService.PayAsync(created.Payment.OrderId.Value,
                decimal.ToInt64(amountInRials), cancellation);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(exception, "Mellat Pay request failed for payment {PaymentId}", created.Payment.Id);
            await FailPaymentAsync(created.Payment, cancellation);
            return Result<CheckoutOutput>.Failure("Payment gateway did not respond");
        }

        if (payResponse.ResponseCode != "0" || string.IsNullOrWhiteSpace(payResponse.RefId))
        {
            created.Payment.PayResponseCode = payResponse.ResponseCode;
            await FailPaymentAsync(created.Payment, cancellation);
            return Result<CheckoutOutput>.Failure($"Payment gateway rejected the request ({payResponse.ResponseCode})");
        }

        created.Payment.PayResponseCode = payResponse.ResponseCode;
        created.Payment.RefId = payResponse.RefId;
        created.Payment.PaymentStatus = PaymentStatusEnum.ProcessingPayment;
        created.Invoice.PaymentStatus = PaymentStatusEnum.ProcessingPayment;
        await invoiceRepository.SavePaymentAsync(created.Payment, cancellation);

        return Result<CheckoutOutput>.Success(new CheckoutOutput
        {
            InvoiceId = created.Invoice.Id,
            PaymentId = created.Payment.Id,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            Amount = created.Payment.Amount,
            PaymentStatus = created.Payment.PaymentStatus,
            RefId = created.Payment.RefId,
            GatewayUrl = mellatSettings.GatewayUrl
        });
    }

    public async Task<Result<CheckoutOutput>> PaymentRetryAsync(int invoiceId, int userId,
        CancellationToken cancellation)
    {
        var invoice = await invoiceRepository.GetAsync(invoiceId, userId, cancellation);
        if (invoice == null)
            return Result<CheckoutOutput>.Failure("Invoice not found");

        if (invoice.PaymentStatus is not (PaymentStatusEnum.Failed or PaymentStatusEnum.Cancelled))
            return Result<CheckoutOutput>.Failure("Invoice is not available for payment retry");

        if (!invoice.ExpiresAt.HasValue || invoice.ExpiresAt.Value <= DateTime.UtcNow)
            return Result<CheckoutOutput>.Failure("Invoice payment time has expired");

        if (invoice.PaymentMethod != PaymentMethodEnum.Online)
            return Result<CheckoutOutput>.Failure("Only online payment is currently available");

        var amount = invoice.Payments.OrderBy(x => x.Id).FirstOrDefault()?.Amount;
        if (!amount.HasValue)
            return Result<CheckoutOutput>.Failure("Payment amount is invalid");

        var amountInRials = amount.Value * 10m;
        if (amount.Value <= 0 || amountInRials != decimal.Truncate(amountInRials) ||
            amountInRials > long.MaxValue)
            return Result<CheckoutOutput>.Failure("Payment amount is invalid");

        MellatPaymentOptions mellatSettings;
        try
        {
            mellatSettings = mellatPaymentService.Settings;
        }
        catch (InvalidOperationException exception)
        {
            logger.LogError(exception, "Mellat payment configuration is invalid");
            return Result<CheckoutOutput>.Failure("Online payment is not available");
        }

        var payment = await invoiceRepository.PaymentCreateAsync(new PaymentEntity
        {
            Amount = amount.Value,
            PaymentMethod = invoice.PaymentMethod,
            PaymentStatus = PaymentStatusEnum.New,
            InvoiceId = invoice.Id,
            Invoice = invoice
        }, cancellation);
        payment.OrderId = payment.Id;
        await invoiceRepository.SavePaymentAsync(payment, cancellation);

        MellatPayResponse payResponse;
        try
        {
            payResponse = await mellatPaymentService.PayAsync(payment.OrderId.Value,
                decimal.ToInt64(amountInRials), cancellation);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(exception, "Mellat Pay request failed for payment {PaymentId}", payment.Id);
            await FailPaymentAsync(payment, cancellation);
            return Result<CheckoutOutput>.Failure("Payment gateway did not respond");
        }

        if (payResponse.ResponseCode != "0" || string.IsNullOrWhiteSpace(payResponse.RefId))
        {
            payment.PayResponseCode = payResponse.ResponseCode;
            await FailPaymentAsync(payment, cancellation);
            return Result<CheckoutOutput>.Failure($"Payment gateway rejected the request ({payResponse.ResponseCode})");
        }

        payment.PayResponseCode = payResponse.ResponseCode;
        payment.RefId = payResponse.RefId;
        payment.PaymentStatus = PaymentStatusEnum.ProcessingPayment;
        invoice.PaymentStatus = PaymentStatusEnum.ProcessingPayment;
        await invoiceRepository.SavePaymentAsync(payment, cancellation);

        return Result<CheckoutOutput>.Success(new CheckoutOutput
        {
            InvoiceId = invoice.Id,
            PaymentId = payment.Id,
            Subtotal = amount.Value,
            Amount = amount.Value,
            PaymentStatus = payment.PaymentStatus,
            RefId = payment.RefId,
            GatewayUrl = mellatSettings.GatewayUrl
        });
    }

    public async Task<MellatCallbackOutput> MellatCallbackAsync(MellatCallbackInput input,
        CancellationToken cancellation)
    {
        if (!input.SaleOrderId.HasValue || input.SaleOrderId <= 0 || string.IsNullOrWhiteSpace(input.RefId))
            return FailedCallback();

        var payment = await invoiceRepository.PaymentGetByOrderIdAsync(input.SaleOrderId.Value, cancellation);
        if (payment == null ||
            payment.PaymentMethod != PaymentMethodEnum.Online ||
            !string.Equals(payment.RefId, input.RefId, StringComparison.Ordinal))
            return FailedCallback(payment?.InvoiceId);

        if (payment.SaleReferenceId.HasValue && payment.VerifiedAt.HasValue &&
            payment.SaleReferenceId != input.SaleReferenceId)
            return FailedCallback(payment.InvoiceId);

        if (payment.PaymentStatus == PaymentStatusEnum.PaymentCompleted)
            return SuccessfulCallback(payment.InvoiceId);

        if (IsPaidInvoiceStatus(payment.Invoice.PaymentStatus))
            return SuccessfulCallback(payment.InvoiceId);

        payment.CallbackResponseCode = input.ResCode;
        payment.CardHolderPan = input.CardHolderPan;
        payment.SaleReferenceId = input.SaleReferenceId;

        if (!input.SaleReferenceId.HasValue || input.SaleReferenceId <= 0)
        {
            await FailPaymentAsync(payment, cancellation);
            return FailedCallback(payment.InvoiceId);
        }

        if (input.FinalAmount is > 0)
        {
            if (input.FinalAmount.Value % 10 != 0 || input.FinalAmount.Value / 10m != payment.Amount)
            {
                logger.LogWarning("Mellat callback amount mismatch for payment {PaymentId}", payment.Id);
                await FailPaymentAsync(payment, cancellation);
                return FailedCallback(payment.InvoiceId);
            }

            payment.PaidAmount = input.FinalAmount.Value / 10m;
        }

        payment.PaymentStatus = PaymentStatusEnum.ProcessingPayment;
        if (!IsPaidInvoiceStatus(payment.Invoice.PaymentStatus))
            payment.Invoice.PaymentStatus = PaymentStatusEnum.ProcessingPayment;
        await invoiceRepository.SavePaymentAsync(payment, cancellation);

        string verifyCode;
        try
        {
            verifyCode = await mellatPaymentService.VerifyAsync(payment.OrderId!.Value,
                input.SaleReferenceId.Value, cancellation);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogWarning(exception, "Mellat Verify response was not received for payment {PaymentId}", payment.Id);
            return await ResolveUnknownVerifyAsync(payment, input.SaleReferenceId.Value, cancellation);
        }

        payment.VerifyResponseCode = verifyCode;
        if (verifyCode == "45")
            return await CompletePaymentAsync(payment, cancellation);

        if (verifyCode is not ("0" or "43"))
        {
            if (IsPendingBankCode(verifyCode))
            {
                await invoiceRepository.SavePaymentAsync(payment, cancellation);
                return PendingCallback(payment.InvoiceId);
            }

            await FailPaymentAsync(payment, cancellation);
            return FailedCallback(payment.InvoiceId);
        }

        payment.VerifiedAt = DateTime.UtcNow;
        return await SettleAsync(payment, input.SaleReferenceId.Value, cancellation);
    }

    private async Task<MellatCallbackOutput> ResolveUnknownVerifyAsync(PaymentEntity payment,
        long saleReferenceId, CancellationToken cancellation)
    {
        try
        {
            var inquiryCode = await mellatPaymentService.InquiryAsync(payment.OrderId!.Value,
                saleReferenceId, cancellation);
            payment.VerifyResponseCode = inquiryCode;
            if (inquiryCode == "45")
                return await CompletePaymentAsync(payment, cancellation);

            if (inquiryCode is "0" or "43")
            {
                payment.VerifiedAt = DateTime.UtcNow;
                return await SettleAsync(payment, saleReferenceId, cancellation);
            }

            if (inquiryCode == "48")
            {
                await FailPaymentAsync(payment, cancellation);
                return FailedCallback(payment.InvoiceId);
            }

            if (!IsPendingBankCode(inquiryCode))
            {
                await FailPaymentAsync(payment, cancellation);
                return FailedCallback(payment.InvoiceId);
            }
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogWarning(exception, "Mellat Inquiry failed for payment {PaymentId}", payment.Id);
        }

        await invoiceRepository.SavePaymentAsync(payment, cancellation);
        return PendingCallback(payment.InvoiceId);
    }

    private async Task<MellatCallbackOutput> SettleAsync(PaymentEntity payment, long saleReferenceId,
        CancellationToken cancellation)
    {
        try
        {
            payment.SettleResponseCode = await mellatPaymentService.SettleAsync(payment.OrderId!.Value,
                saleReferenceId, cancellation);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogWarning(exception, "Mellat Settle response was not received for payment {PaymentId}", payment.Id);
            await invoiceRepository.SavePaymentAsync(payment, cancellation);
            return PendingCallback(payment.InvoiceId);
        }

        if (payment.SettleResponseCode is "0" or "45")
            return await CompletePaymentAsync(payment, cancellation);

        if (payment.SettleResponseCode == "48")
        {
            await FailPaymentAsync(payment, cancellation);
            return FailedCallback(payment.InvoiceId);
        }

        await invoiceRepository.SavePaymentAsync(payment, cancellation);
        return PendingCallback(payment.InvoiceId);
    }

    private async Task<MellatCallbackOutput> CompletePaymentAsync(PaymentEntity payment,
        CancellationToken cancellation)
    {
        payment.PaidAmount ??= payment.Amount;
        payment.VerifiedAt ??= DateTime.UtcNow;
        payment.SettledAt = DateTime.UtcNow;
        await invoiceRepository.CompletePaymentAsync(payment, cancellation);
        return SuccessfulCallback(payment.InvoiceId);
    }

    private async Task FailPaymentAsync(PaymentEntity payment, CancellationToken cancellation)
    {
        payment.PaymentStatus = PaymentStatusEnum.Failed;
        if (!IsPaidInvoiceStatus(payment.Invoice.PaymentStatus))
            payment.Invoice.PaymentStatus = PaymentStatusEnum.Failed;
        await invoiceRepository.SavePaymentAsync(payment, cancellation);
    }

    private static bool IsPaidInvoiceStatus(PaymentStatusEnum status) =>
        status is PaymentStatusEnum.PaymentCompleted
            or PaymentStatusEnum.Preparing
            or PaymentStatusEnum.ReadyForShipment
            or PaymentStatusEnum.Shipping
            or PaymentStatusEnum.Delivered;

    private static bool IsPendingBankCode(string code) =>
        code is "28" or "30" or "34" or "36" or "37" or "38" or "39" or "112" or "113" or "116" or "117" or
            "211" or "997";

    private static MellatCallbackOutput SuccessfulCallback(int invoiceId) => new()
    {
        IsSuccessful = true,
        InvoiceId = invoiceId
    };

    private static MellatCallbackOutput PendingCallback(int invoiceId) => new()
    {
        IsPending = true,
        InvoiceId = invoiceId
    };

    private static MellatCallbackOutput FailedCallback(int? invoiceId = null) => new()
    {
        InvoiceId = invoiceId
    };

    private static decimal GetUnitPrice(ProductVariantEntity variant, ProductEntity product) =>
        Math.Max(0, variant.Price - product.Discount);

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
                Name = x.Name,
                Code = x.Code
            }).ToList()
    };

}

using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Products;
using Store.Domain.Sellers;
using Store.Domain.Sellers.Models.Input;
using Store.Domain.Sellers.Models.Output;

namespace Store.Service.EntityService;

public class SellerService(
    ISellerRepository sellerRepository,
    IInvoiceRepository invoiceRepository,
    IProductRepository productRepository,
    FileService fileService)
{
    private readonly SellerReportingService sellerReportingService = new(
        sellerRepository,
        invoiceRepository,
        productRepository);

    public async Task<Result<List<SellerListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await sellerRepository.ListAsync(userId, cancellation);
        var result = new List<SellerListOutput>();

        foreach (var entity in entities)
        {
            var imageResult = await fileService.GetAsync(
                TableNameEnum.Sellers,
                TargetNameEnum.SellerId,
                entity.Id,
                cancellation);

            SellerImageListOutput? image = null;

            if (imageResult.Data != null)
            {
                image = new SellerImageListOutput
                {
                    Id = imageResult.Data.Id,
                    Name = imageResult.Data.Name,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    FileType = imageResult.Data.FileType
                };
            }

            result.Add(new SellerListOutput
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Address = entity.Address,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
                Status = entity.Status,
                Image = image
            });
        }

        return Result<List<SellerListOutput>>.Success(result);
    }

    public async Task<Result<SellerGetOutput>> GetAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<SellerGetOutput>.Failure("فروشنده یافت نشد");

        var imagesResult = await fileService.ListAsync(
            TableNameEnum.Sellers,
            TargetNameEnum.SellerId,
            entity.Id,
            cancellation);

        var images = new List<SellerImageGetOutput>();

        if (imagesResult.Data != null)
        {
            foreach (var image in imagesResult.Data)
            {
                images.Add(new SellerImageGetOutput
                {
                    Id = image.Id,
                    Name = image.Name,
                    Url = image.Url,
                    IsMain = image.IsMain,
                    FileType = image.FileType
                });
            }
        }

        var output = new SellerGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Address = entity.Address,
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            Status = entity.Status,
            Images = images
        };

        return Result<SellerGetOutput>.Success(output);
    }

    public async Task<Result<SellerCreateOutput>> CreateAsync(int userId, SellerCreateInput input, CancellationToken cancellation)
    {
        var entity = new SellerEntity
        {
            Name = input.Name,
            Description = input.Description,
            Address = input.Address,
            Latitude = input.Latitude,
            Longitude = input.Longitude,
            Status = SellerStatusEnum.Active,
            UserId = userId
        };

        var created = await sellerRepository.CreateAsync(entity, cancellation);

        return Result<SellerCreateOutput>.Success(new SellerCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Description = created.Description,
            Address = created.Address,
            Latitude = created.Latitude,
            Longitude = created.Longitude,
            Status = created.Status
        });
    }

    public async Task<Result<SellerUpdateOutput>> UpdateAsync(int id, int userId, SellerUpdateInput input, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<SellerUpdateOutput>.Failure("فروشنده یافت نشد");

        entity.Name = input.Name;
        entity.Description = input.Description;
        entity.Address = input.Address;
        entity.Latitude = input.Latitude;
        entity.Longitude = input.Longitude;
        entity.Status = input.Status;

        var updated = await sellerRepository.UpdateAsync(entity, cancellation);

        return Result<SellerUpdateOutput>.Success(new SellerUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            Description = updated.Description,
            Address = updated.Address,
            Latitude = updated.Latitude,
            Longitude = updated.Longitude,
            Status = updated.Status
        });
    }

    public async Task<Result<bool>> DeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await sellerRepository.GetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<bool>.Failure("فروشنده یافت نشد");

        await sellerRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }

    public async Task<Result<SellerDashboardOutput>> DashboardAsync(int userId, SellerDashboardInput input,
        CancellationToken cancellation) => await sellerReportingService.DashboardAsync(userId, input, cancellation);

    public async Task<Result<List<SellerSalesChartOutput>>> SalesChartAsync(int userId,
        SellerSalesChartInput input, CancellationToken cancellation) =>
        await sellerReportingService.SalesChartAsync(userId, input, cancellation);

    public async Task<Result<SellerTopProductsOutput>> TopProductsAsync(int userId,
        SellerTopProductsInput input, CancellationToken cancellation) =>
        await sellerReportingService.TopProductsAsync(userId, input, cancellation);

    public async Task<Result<SellerTopVariantsOutput>> TopVariantsAsync(int userId,
        SellerTopVariantsInput input, CancellationToken cancellation) =>
        await sellerReportingService.TopVariantsAsync(userId, input, cancellation);

    public async Task<Result<List<SellerOrderStatusListOutput>>> OrderStatusesAsync(int userId,
        SellerOrderStatusesInput input, CancellationToken cancellation) =>
        await sellerReportingService.OrderStatusesAsync(userId, input, cancellation);

    public async Task<Result<SellerLowStockOutput>> LowStockAsync(int userId, SellerLowStockInput input,
        CancellationToken cancellation) => await sellerReportingService.LowStockAsync(userId, input, cancellation);

    public async Task<Result<SellerProductsWithoutSalesOutput>> ProductsWithoutSalesAsync(int userId,
        SellerProductsWithoutSalesInput input, CancellationToken cancellation) =>
        await sellerReportingService.ProductsWithoutSalesAsync(userId, input, cancellation);

    public async Task<Result<List<SellerCategorySalesOutput>>> CategorySalesAsync(int userId,
        SellerCategorySalesInput input, CancellationToken cancellation) =>
        await sellerReportingService.CategorySalesAsync(userId, input, cancellation);

    public async Task<Result<List<SellerDiscountStatisticsOutput>>> DiscountStatisticsAsync(int userId,
        SellerDiscountStatisticsInput input, CancellationToken cancellation) =>
        await sellerReportingService.DiscountStatisticsAsync(userId, input, cancellation);

    public async Task<Result<List<SellerOrderAttentionListOutput>>> OrdersAttentionAsync(int userId,
        SellerOrdersAttentionInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<List<SellerOrderAttentionListOutput>>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<List<SellerOrderAttentionListOutput>>.Failure(dateError);

        if (input.PaymentStatus.HasValue && !IsFulfillmentStatus(input.PaymentStatus.Value))
            return Result<List<SellerOrderAttentionListOutput>>.Failure("وضعیت سفارش برای فروشنده نامعتبر است");

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var result = invoices
            .Where(x => input.PaymentStatus.HasValue
                ? x.PaymentStatus == input.PaymentStatus.Value
                : IsActiveFulfillmentStatus(x.PaymentStatus))
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .Select(x =>
            {
                var items = GetSellerItems(x, sellerIds);
                return new SellerOrderAttentionListOutput
                {
                    Id = x.Id,
                    TotalPrice = GetItemsAmount(items),
                    TotalCount = items.Sum(item => item.ProductCount),
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    PaymentStatus = x.PaymentStatus,
                    PaymentMethod = x.PaymentMethod,
                    DeliveryMethod = x.DeliveryMethod,
                    Address = x.User.Address!
                };
            })
            .ToList();

        return Result<List<SellerOrderAttentionListOutput>>.Success(result);
    }

    public async Task<Result<SellerOrderDetailOutput>> OrderGetAsync(int id, int userId,
        CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerOrderDetailOutput>.Failure(sellerError);

        var invoice = await invoiceRepository.SellerGetAsync(id, userId, cancellation);
        if (invoice == null || !IsFulfillmentStatus(invoice.PaymentStatus))
            return Result<SellerOrderDetailOutput>.Failure("سفارش یافت نشد");

        var sellerItems = GetSellerItems(invoice, sellerIds);
        var items = new List<SellerOrderItemOutput>();
        foreach (var item in sellerItems)
        {
            var image = await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId,
                item.ProductId, cancellation);
            items.Add(new SellerOrderItemOutput
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                CategoryName = item.Product.Category.Name,
                ProductVariantId = item.ProductVariantId,
                ProductCount = item.ProductCount,
                ProductPrice = item.ProductPrice,
                TotalPrice = item.ProductPrice * item.ProductCount,
                ImageUrl = image.Data?.Url,
                Values = item.ProductVariant.AttributeValues.Select(value =>
                    new SellerOrderVariantValueOutput
                    {
                        Id = value.Id,
                        Size = value.Size,
                        ColorName = value.ColorName,
                        ColorCode = value.ColorCode
                    }).ToList()
            });
        }

        return Result<SellerOrderDetailOutput>.Success(new SellerOrderDetailOutput
        {
            Id = invoice.Id,
            TotalPrice = GetItemsAmount(sellerItems),
            TotalCount = sellerItems.Sum(item => item.ProductCount),
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt,
            PaymentStatus = invoice.PaymentStatus,
            PaymentMethod = invoice.PaymentMethod,
            DeliveryMethod = invoice.DeliveryMethod,
            Customer = new SellerOrderCustomerOutput
            {
                FirstName = invoice.User.FirstName,
                LastName = invoice.User.LastName,
                PhoneNumber = invoice.User.PhoneNumber,
                Address = invoice.User.Address,
                PostalCode = invoice.User.PostalCode,
                Latitude = invoice.User.Latitude,
                Longitude = invoice.User.Longitude
            },
            Items = items
        });
    }

    public async Task<Result<SellerOrderStatusUpdateOutput>> OrderStatusUpdateAsync(int id, int userId,
        SellerOrderStatusUpdateInput input, CancellationToken cancellation)
    {
        var (_, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerOrderStatusUpdateOutput>.Failure(sellerError);

        if (!Enum.IsDefined(input.PaymentStatus))
            return Result<SellerOrderStatusUpdateOutput>.Failure("وضعیت پرداخت نامعتبر است");

        var entity = await invoiceRepository.SellerGetAsync(id, userId, cancellation);
        if (entity == null)
            return Result<SellerOrderStatusUpdateOutput>.Failure("سفارش یافت نشد");

        if (!IsAllowedOrderStatusTransition(entity.PaymentStatus, input.PaymentStatus))
            return Result<SellerOrderStatusUpdateOutput>.Failure("تغییر وضعیت پرداخت نامعتبر است");

        entity.PaymentStatus = input.PaymentStatus;
        var updated = await invoiceRepository.UpdateAsync(entity, cancellation);

        return Result<SellerOrderStatusUpdateOutput>.Success(new SellerOrderStatusUpdateOutput
        {
            Id = updated.Id,
            PaymentStatus = updated.PaymentStatus
        });
    }

    private async Task<(HashSet<int> SellerIds, string? Error)> GetSellerIdsAsync(int userId,
        CancellationToken cancellation)
    {
        var sellers = await sellerRepository.ListAsync(userId, cancellation);
        if (sellers.Count == 0)
            return (new HashSet<int>(), "فروشنده یافت نشد");
        return (sellers.Select(x => x.Id).ToHashSet(), null);
    }

    private static string? ValidateDateRange(DateTime? from, DateTime? to)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
            return "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد";
        return null;
    }

    private static bool IsAllowedOrderStatusTransition(PaymentStatusEnum current, PaymentStatusEnum next) =>
        current switch
        {
            PaymentStatusEnum.PaymentCompleted => next is PaymentStatusEnum.Preparing,
            PaymentStatusEnum.Preparing => next is PaymentStatusEnum.ReadyForShipment,
            PaymentStatusEnum.ReadyForShipment => next is PaymentStatusEnum.Shipping,
            PaymentStatusEnum.Shipping => next is PaymentStatusEnum.Delivered,
            _ => false
        };

    private static bool IsFulfillmentStatus(PaymentStatusEnum status) =>
        status is PaymentStatusEnum.PaymentCompleted
            or PaymentStatusEnum.Preparing
            or PaymentStatusEnum.ReadyForShipment
            or PaymentStatusEnum.Shipping
            or PaymentStatusEnum.Delivered;

    private static bool IsActiveFulfillmentStatus(PaymentStatusEnum status) =>
        status is PaymentStatusEnum.PaymentCompleted
            or PaymentStatusEnum.Preparing
            or PaymentStatusEnum.ReadyForShipment
            or PaymentStatusEnum.Shipping;

    private static List<InvoiceItemEntity> GetSellerItems(InvoiceEntity invoice, HashSet<int> sellerIds) =>
        invoice.InvoiceItems.Where(x => sellerIds.Contains(x.Product.SellerId)).ToList();

    private static decimal GetItemsAmount(IEnumerable<InvoiceItemEntity> items) =>
        items.Sum(x => x.ProductPrice * x.ProductCount);

}

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
            return Result<SellerGetOutput>.Failure("Seller not found");

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
            return Result<SellerUpdateOutput>.Failure("Seller not found");

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
            return Result<bool>.Failure("Seller not found");

        await sellerRepository.DeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }

    public async Task<Result<SellerDashboardOutput>> DashboardAsync(int userId, SellerDashboardInput input,
        CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerDashboardOutput>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<SellerDashboardOutput>.Failure(dateError);

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);
        var successfulInvoices = invoices.Where(IsSuccessfulOrder).ToList();

        decimal totalSales = 0;
        int itemsSoldCount = 0;
        decimal discountAmount = 0;

        foreach (var invoice in successfulInvoices)
        {
            var items = GetSellerItems(invoice, sellerIds);
            totalSales += GetItemsAmount(items);
            itemsSoldCount += items.Sum(x => x.ProductCount);
            discountAmount += GetSellerDiscountShare(invoice, sellerIds);
        }

        var output = new SellerDashboardOutput
        {
            TotalSales = totalSales,
            OrderCount = invoices.Count,
            ItemsSoldCount = itemsSoldCount,
            AverageOrderValue = successfulInvoices.Count == 0
                ? 0
                : decimal.Round(totalSales / successfulInvoices.Count, 2, MidpointRounding.AwayFromZero),
            CompletedOrderCount = invoices.Count(x => x.PaymentStatus == PaymentStatusEnum.Delivered),
            CancelledOrderCount = invoices.Count(x => x.PaymentStatus == PaymentStatusEnum.Cancelled),
            DiscountAmount = discountAmount
        };

        return Result<SellerDashboardOutput>.Success(output);
    }

    public async Task<Result<List<SellerSalesChartOutput>>> SalesChartAsync(int userId,
        SellerSalesChartInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<List<SellerSalesChartOutput>>.Failure(sellerError);

        if (!Enum.IsDefined(input.GroupBy))
            return Result<List<SellerSalesChartOutput>>.Failure("Group by is invalid");

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<List<SellerSalesChartOutput>>.Failure(dateError);

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var result = invoices
            .Where(IsSuccessfulOrder)
            .SelectMany(invoice =>
            {
                var key = GetSalesChartGroupKey(invoice.CreatedAt, input.GroupBy);
                return GetSellerItems(invoice, sellerIds).Select(item => new
                {
                    Key = key,
                    InvoiceId = invoice.Id,
                    Sales = item.ProductPrice * item.ProductCount,
                    Count = item.ProductCount
                });
            })
            .GroupBy(x => x.Key)
            .Select(group => new SellerSalesChartOutput
            {
                Date = group.Key,
                SalesAmount = group.Sum(x => x.Sales),
                OrderCount = group.Select(x => x.InvoiceId).Distinct().Count(),
                ItemsSoldCount = group.Sum(x => x.Count)
            })
            .OrderBy(x => x.Date)
            .ToList();

        return Result<List<SellerSalesChartOutput>>.Success(result);
    }

    public async Task<Result<SellerTopProductsOutput>> TopProductsAsync(int userId,
        SellerTopProductsInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerTopProductsOutput>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<SellerTopProductsOutput>.Failure(dateError);

        var page = input.Page < 1 ? 1 : input.Page;
        var pageSize = input.PageSize < 1 ? 10 : input.PageSize;

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var items = invoices
            .Where(IsSuccessfulOrder)
            .SelectMany(invoice => GetSellerItems(invoice, sellerIds)
                .Select(item => new
                {
                    item.ProductId,
                    item.Product.Name,
                    item.ProductCount,
                    Sales = item.ProductPrice * item.ProductCount
                }))
            .GroupBy(x => x.ProductId)
            .Select(group => new SellerTopProductItemOutput
            {
                ProductId = group.Key,
                ProductName = group.First().Name,
                UnitsSold = group.Sum(x => x.ProductCount),
                SalesAmount = group.Sum(x => x.Sales)
            })
            .OrderByDescending(x => x.SalesAmount)
            .ThenByDescending(x => x.UnitsSold)
            .ThenBy(x => x.ProductId)
            .ToList();

        var output = new SellerTopProductsOutput
        {
            TotalCount = items.Count,
            Items = items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList()
        };

        return Result<SellerTopProductsOutput>.Success(output);
    }

    public async Task<Result<SellerTopVariantsOutput>> TopVariantsAsync(int userId,
        SellerTopVariantsInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerTopVariantsOutput>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<SellerTopVariantsOutput>.Failure(dateError);

        var page = input.Page < 1 ? 1 : input.Page;
        var pageSize = input.PageSize < 1 ? 10 : input.PageSize;

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var items = invoices
            .Where(IsSuccessfulOrder)
            .SelectMany(invoice => GetSellerItems(invoice, sellerIds)
                .Select(item => new
                {
                    item.ProductVariantId,
                    item.ProductId,
                    item.Product.Name,
                    item.ProductVariant.Price,
                    item.ProductVariant.Stock,
                    Values = item.ProductVariant.AttributeValues,
                    item.ProductCount,
                    Sales = item.ProductPrice * item.ProductCount
                }))
            .GroupBy(x => x.ProductVariantId)
            .Select(group =>
            {
                var first = group.First();
                return new SellerTopVariantItemOutput
                {
                    ProductVariantId = group.Key,
                    ProductId = first.ProductId,
                    ProductName = first.Name,
                    Price = first.Price,
                    Stock = first.Stock,
                    Values = first.Values
                        .OrderBy(x => x.Size)
                        .ThenBy(x => x.Id)
                        .Select(x => new SellerTopVariantValueItemOutput
                        {
                            Id = x.Id,
                            Size = x.Size,
                            Name = x.Name,
                            Code = x.Code
                        }).ToList(),
                    UnitsSold = group.Sum(x => x.ProductCount),
                    SalesAmount = group.Sum(x => x.Sales)
                };
            })
            .OrderByDescending(x => x.SalesAmount)
            .ThenByDescending(x => x.UnitsSold)
            .ThenBy(x => x.ProductVariantId)
            .ToList();

        var output = new SellerTopVariantsOutput
        {
            TotalCount = items.Count,
            Items = items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList()
        };

        return Result<SellerTopVariantsOutput>.Success(output);
    }

    public async Task<Result<List<SellerOrderStatusListOutput>>> OrderStatusesAsync(int userId,
        SellerOrderStatusesInput input, CancellationToken cancellation)
    {
        var (_, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<List<SellerOrderStatusListOutput>>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<List<SellerOrderStatusListOutput>>.Failure(dateError);

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var result = Enum.GetValues<PaymentStatusEnum>()
            .Select(status => new SellerOrderStatusListOutput
            {
                PaymentStatus = status,
                Count = invoices.Count(x => x.PaymentStatus == status)
            })
            .ToList();

        return Result<List<SellerOrderStatusListOutput>>.Success(result);
    }

    public async Task<Result<SellerLowStockOutput>> LowStockAsync(int userId, SellerLowStockInput input,
        CancellationToken cancellation)
    {
        var (_, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerLowStockOutput>.Failure(sellerError);

        if (input.Threshold < 0)
            return Result<SellerLowStockOutput>.Failure("Threshold cannot be negative");

        var page = input.Page < 1 ? 1 : input.Page;
        var pageSize = input.PageSize < 1 ? 10 : input.PageSize;

        var products = await productRepository.SellerProductListAsync(userId, cancellation);

        var variants = products
            .SelectMany(product => product.ProductVariants
                .Where(variant => variant.Stock <= input.Threshold)
                .Select(variant => new { product, variant }))
            .OrderBy(x => x.variant.Stock)
            .ThenBy(x => x.variant.Id)
            .ToList();

        var output = new SellerLowStockOutput
        {
            TotalCount = variants.Count,
            Items = variants
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new SellerLowStockItemOutput
                {
                    ProductVariantId = x.variant.Id,
                    ProductId = x.product.Id,
                    ProductName = x.product.Name,
                    Price = x.variant.Price,
                    Values = x.variant.AttributeValues
                        .OrderBy(value => value.Size)
                        .ThenBy(value => value.Id)
                        .Select(value => new SellerLowStockValueItemOutput
                        {
                            Id = value.Id,
                            Size = value.Size,
                            Name = value.Name,
                            Code = value.Code
                        }).ToList(),
                    Stock = x.variant.Stock
                })
                .ToList()
        };

        return Result<SellerLowStockOutput>.Success(output);
    }

    public async Task<Result<SellerProductsWithoutSalesOutput>> ProductsWithoutSalesAsync(int userId,
        SellerProductsWithoutSalesInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerProductsWithoutSalesOutput>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<SellerProductsWithoutSalesOutput>.Failure(dateError);

        var page = input.Page < 1 ? 1 : input.Page;
        var pageSize = input.PageSize < 1 ? 10 : input.PageSize;

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var soldProductIds = invoices
            .Where(IsSuccessfulOrder)
            .SelectMany(invoice => GetSellerItems(invoice, sellerIds))
            .Select(x => x.ProductId)
            .ToHashSet();

        var products = await productRepository.SellerProductListAsync(userId, cancellation);

        var items = products
            .Where(x => !soldProductIds.Contains(x.Id))
            .OrderByDescending(x => x.Id)
            .ToList();

        var output = new SellerProductsWithoutSalesOutput
        {
            TotalCount = items.Count,
            Items = items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new SellerProductsWithoutSalesItemOutput
                {
                    ProductId = x.Id,
                    ProductName = x.Name
                })
                .ToList()
        };

        return Result<SellerProductsWithoutSalesOutput>.Success(output);
    }

    public async Task<Result<List<SellerCategorySalesOutput>>> CategorySalesAsync(int userId,
        SellerCategorySalesInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<List<SellerCategorySalesOutput>>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<List<SellerCategorySalesOutput>>.Failure(dateError);

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var result = invoices
            .Where(IsSuccessfulOrder)
            .SelectMany(invoice => GetSellerItems(invoice, sellerIds)
                .Select(item => new
                {
                    invoice.Id,
                    item.Product.CategoryId,
                    item.Product.Category.Name,
                    item.ProductCount,
                    Sales = item.ProductPrice * item.ProductCount
                }))
            .GroupBy(x => x.CategoryId)
            .Select(group => new SellerCategorySalesOutput
            {
                CategoryId = group.Key,
                CategoryName = group.First().Name,
                SalesAmount = group.Sum(x => x.Sales),
                UnitsSold = group.Sum(x => x.ProductCount),
                OrderCount = group.Select(x => x.Id).Distinct().Count()
            })
            .OrderByDescending(x => x.SalesAmount)
            .ThenBy(x => x.CategoryId)
            .ToList();

        return Result<List<SellerCategorySalesOutput>>.Success(result);
    }

    public async Task<Result<List<SellerDiscountStatisticsOutput>>> DiscountStatisticsAsync(int userId,
        SellerDiscountStatisticsInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<List<SellerDiscountStatisticsOutput>>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<List<SellerDiscountStatisticsOutput>>.Failure(dateError);

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var result = invoices
            .Where(IsSuccessfulOrder)
            .Where(x => x.DiscountCodeId.HasValue && x.DiscountCode != null)
            .GroupBy(x => x.DiscountCodeId!.Value)
            .Select(group => new SellerDiscountStatisticsOutput
            {
                DiscountCodeId = group.Key,
                Code = group.First().DiscountCode!.Code,
                UsageCount = group.Count(),
                DiscountAmount = group.Sum(x => GetSellerDiscountShare(x, sellerIds)),
                SalesAmount = group.Sum(x => GetItemsAmount(GetSellerItems(x, sellerIds)))
            })
            .OrderByDescending(x => x.UsageCount)
            .ThenBy(x => x.DiscountCodeId)
            .ToList();

        return Result<List<SellerDiscountStatisticsOutput>>.Success(result);
    }

    public async Task<Result<List<SellerOrderAttentionListOutput>>> OrdersAttentionAsync(int userId,
        SellerOrdersAttentionInput input, CancellationToken cancellation)
    {
        var (sellerIds, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<List<SellerOrderAttentionListOutput>>.Failure(sellerError);

        var dateError = ValidateDateRange(input.From, input.To);
        if (dateError != null)
            return Result<List<SellerOrderAttentionListOutput>>.Failure(dateError);

        if (input.StuckDays < 1)
            return Result<List<SellerOrderAttentionListOutput>>.Failure("Stuck days must be greater than zero");

        var invoices = await invoiceRepository.SellerListAsync(userId, input.From, input.To, cancellation);

        var attentionStatuses = new HashSet<PaymentStatusEnum>
        {
            PaymentStatusEnum.New,
            PaymentStatusEnum.Preparing,
            PaymentStatusEnum.ReadyForShipment
        };
        var terminalStatuses = new HashSet<PaymentStatusEnum>
        {
            PaymentStatusEnum.Delivered,
            PaymentStatusEnum.Cancelled,
            PaymentStatusEnum.Failed
        };
        var stuckBefore = DateTime.UtcNow.AddDays(-input.StuckDays);

        var result = invoices
            .Where(x => attentionStatuses.Contains(x.PaymentStatus) ||
                        (!terminalStatuses.Contains(x.PaymentStatus) && x.UpdatedAt <= stuckBefore))
            .OrderBy(x => x.CreatedAt)
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

    public async Task<Result<SellerOrderStatusUpdateOutput>> OrderStatusUpdateAsync(int id, int userId,
        SellerOrderStatusUpdateInput input, CancellationToken cancellation)
    {
        var (_, sellerError) = await GetSellerIdsAsync(userId, cancellation);
        if (sellerError != null)
            return Result<SellerOrderStatusUpdateOutput>.Failure(sellerError);

        if (!Enum.IsDefined(input.PaymentStatus))
            return Result<SellerOrderStatusUpdateOutput>.Failure("Payment status is invalid");

        var entity = await invoiceRepository.SellerGetAsync(id, userId, cancellation);
        if (entity == null)
            return Result<SellerOrderStatusUpdateOutput>.Failure("Order not found");

        if (!IsAllowedOrderStatusTransition(entity.PaymentStatus, input.PaymentStatus))
            return Result<SellerOrderStatusUpdateOutput>.Failure("Payment status transition is invalid");

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
            return (new HashSet<int>(), "Seller not found");
        return (sellers.Select(x => x.Id).ToHashSet(), null);
    }

    private static string? ValidateDateRange(DateTime? from, DateTime? to)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
            return "From cannot be after to";
        return null;
    }

    private static bool IsSuccessfulOrder(InvoiceEntity invoice) =>
        invoice.PaymentStatus is PaymentStatusEnum.PaymentCompleted
            or PaymentStatusEnum.Preparing
            or PaymentStatusEnum.ReadyForShipment
            or PaymentStatusEnum.Shipping
            or PaymentStatusEnum.Delivered;

    private static bool IsAllowedOrderStatusTransition(PaymentStatusEnum current, PaymentStatusEnum next) =>
        current switch
        {
            PaymentStatusEnum.New => next is PaymentStatusEnum.Cancelled,
            PaymentStatusEnum.ProcessingPayment => next is PaymentStatusEnum.Cancelled,
            PaymentStatusEnum.PaymentCompleted =>
                next is PaymentStatusEnum.Preparing or PaymentStatusEnum.Cancelled,
            PaymentStatusEnum.Preparing =>
                next is PaymentStatusEnum.ReadyForShipment or PaymentStatusEnum.Cancelled,
            PaymentStatusEnum.ReadyForShipment =>
                next is PaymentStatusEnum.Shipping or PaymentStatusEnum.Cancelled,
            PaymentStatusEnum.Shipping =>
                next is PaymentStatusEnum.Delivered or PaymentStatusEnum.Cancelled,
            _ => false
        };

    private static List<InvoiceItemEntity> GetSellerItems(InvoiceEntity invoice, HashSet<int> sellerIds) =>
        invoice.InvoiceItems.Where(x => sellerIds.Contains(x.Product.SellerId)).ToList();

    private static decimal GetItemsAmount(IEnumerable<InvoiceItemEntity> items) =>
        items.Sum(x => x.ProductPrice * x.ProductCount);

    private static decimal GetSellerDiscountShare(InvoiceEntity invoice, HashSet<int> sellerIds)
    {
        var subtotal = invoice.InvoiceItems.Sum(x => x.ProductPrice * x.ProductCount);
        if (subtotal <= 0)
            return 0;

        var payment = invoice.Payments.OrderBy(x => x.Id).FirstOrDefault();
        if (payment == null || payment.Amount >= subtotal)
            return 0;

        var sellerAmount = GetItemsAmount(GetSellerItems(invoice, sellerIds));
        var invoiceDiscount = subtotal - payment.Amount;
        return decimal.Round(sellerAmount / subtotal * invoiceDiscount, 2, MidpointRounding.AwayFromZero);
    }

    private static DateTime GetSalesChartGroupKey(DateTime date, SalesChartGroupByEnum groupBy) =>
        groupBy switch
        {
            SalesChartGroupByEnum.Week => date.Date.AddDays(-(((int)date.DayOfWeek + 1) % 7)),
            SalesChartGroupByEnum.Month => new DateTime(date.Year, date.Month, 1),
            _ => date.Date
        };
}

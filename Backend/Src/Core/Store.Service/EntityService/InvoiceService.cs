using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Invoices.Models.Input;
using Store.Domain.Invoices.Models.Output;

namespace Store.Service.EntityService;

public class InvoiceService(
    IInvoiceRepository invoiceRepository,
    FileService fileService)
{
    public async Task<Result<List<PreInvoiceListOutput>>> PreInvoiceListAsync(int userId,
        CancellationToken cancellation)
    {
        var entities = await invoiceRepository.PreInvoiceListAsync(userId, cancellation);
        var result = new List<PreInvoiceListOutput>();
        foreach (var entity in entities)
        {
            var imageResult =
                await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, entity.Product.Id,
                    cancellation);
            PreInvoiceProductImageListOutput? image = null;
            if (imageResult.Data != null)
            {
                image = new PreInvoiceProductImageListOutput
                {
                    Id = imageResult.Data.Id,
                    Name = imageResult.Data.Name,
                    Url = imageResult.Data.Url,
                    IsMain = imageResult.Data.IsMain,
                    FileType = imageResult.Data.FileType,
                };
            }

            result.Add(new PreInvoiceListOutput
            {
                Id = entity.Id,
                ProductCount = entity.ProductCount,
                Product = new PreInvoiceProductListOutput
                {
                    Id = entity.Product.Id,
                    Name = entity.Product.Name,
                    Price = entity.Product.Price,
                    Discount = entity.Product.Discount,
                    Image = image,
                }
            });
        }

        return Result<List<PreInvoiceListOutput>>.Success(result);
    }

    public async Task<Result<PreInvoiceCreateOutput>> PreInvoiceCreateAsync(int userId, PreInvoiceCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new PreInvoiceEntity
        {
            UserId = userId,
            ProductId = input.ProductId,
            ProductCount = input.ProductCount,
        };
        var created = await invoiceRepository.PreInvoiceCreateAsync(entity, cancellation);
        var imageResult =
            await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, created.Product.Id,
                cancellation);
        PreInvoiceProductImageCreateOutput? image = null;
        if (imageResult.Data != null)
        {
            image = new PreInvoiceProductImageCreateOutput
            {
                Id = imageResult.Data.Id,
                Name = imageResult.Data.Name,
                Url = imageResult.Data.Url,
                IsMain = imageResult.Data.IsMain,
                FileType = imageResult.Data.FileType,
            };
        }

        var result = new PreInvoiceCreateOutput
        {
            Id = created.Id,
            ProductCount = created.ProductCount,
            Product = new PreInvoiceProductCreateOutput
            {
                Id = created.Product.Id,
                Name = created.Product.Name,
                Price = created.Product.Price,
                Discount = created.Product.Discount,
                Image = image,
            }
        };
        return Result<PreInvoiceCreateOutput>.Success(result);
    }

    public async Task<Result<PreInvoiceUpdateOutput>> PreInvoiceUpdateAsync(int id, int userId, PreInvoiceUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await invoiceRepository.PreInvoiceGetAsync(id, userId, cancellation);
        if (entity == null)
            return Result<PreInvoiceUpdateOutput>.Failure("PreInvoice not found");

        entity.ProductCount = input.ProductCount;

        var updated = await invoiceRepository.PreInvoiceUpdateAsync(entity, cancellation);
        var imageResult =
            await fileService.GetAsync(TableNameEnum.Products, TargetNameEnum.ProductId, updated.Product.Id,
                cancellation);
        PreInvoiceProductImageUpdateOutput? image = null;
        if (imageResult.Data != null)
        {
            image = new PreInvoiceProductImageUpdateOutput
            {
                Id = imageResult.Data.Id,
                Name = imageResult.Data.Name,
                Url = imageResult.Data.Url,
                IsMain = imageResult.Data.IsMain,
                FileType = imageResult.Data.FileType,
            };
        }

        var result = new PreInvoiceUpdateOutput
        {
            Id = updated.Id,
            ProductCount = updated.ProductCount,
            Product = new PreInvoiceProductUpdateOutput
            {
                Id = updated.Product.Id,
                Name = updated.Product.Name,
                Price = updated.Product.Price,
                Discount = updated.Product.Discount,
                Image = image,
            }
        };
        return Result<PreInvoiceUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> PreInvoiceDeleteAsync(int id, int userId, CancellationToken cancellation)
    {
        var entity = await invoiceRepository.PreInvoiceGetAsync(id, userId, cancellation);

        if (entity == null)
            return Result<bool>.Failure("PreInvoice not found");

        await invoiceRepository.PreInvoiceDeleteAsync(entity, cancellation);

        return Result<bool>.Success(true);
    }

    public async Task<Result<List<InvoiceListOutput>>> ListAsync(int userId, CancellationToken cancellation)
    {
        var entities = await invoiceRepository.ListAsync(userId, cancellation);
        var result = entities
            .GroupBy(x => x.Id)
            .Select(x => new InvoiceListOutput
            {
                Id = x.Key,
                TotalPrice = x.Sum(z => z.ProductPrice),
                TotalCount = x.Count(),
                CreatedAt = x.First().CreatedAt,
                Address = x.First().User.Address!,
                PaymentMethod = x.First().PaymentMethod,
                DeliveryMethod = x.First().DeliveryMethod,
            }).ToList();
        return Result<List<InvoiceListOutput>>.Success(result);
    }
}

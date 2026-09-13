using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Invoices.Models.Input;
using Store.Domain.Invoices.Models.Output;

namespace Store.Service.EntityService;

public class InvoiceService(IInvoiceRepository invoiceRepository, FileService fileService)
{
    public async Task<List<PreInvoiceListOutput>> PreInvoiceListAsync(int userId, CancellationToken cancellation)
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

        return result;
    }

    public async Task<PreInvoiceCreateOutput> PreInvoiceCreateAsync(int userId, PreInvoiceCreateInput input,
        CancellationToken cancellation)
    {
        
    }

    public async Task<List<InvoiceListOutput>> ListAsync(int userId, CancellationToken cancellation)
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
            }).ToList();
        return result;
    }
}
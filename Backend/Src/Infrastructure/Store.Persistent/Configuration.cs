using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using Store.Domain.Accounts;
using Store.Domain.Attribute;
using Store.Domain.Categories;
using Store.Domain.Files;
using Store.Domain.Invoices;
using Store.Domain.Products;
using Store.Domain.Sellers;
using Store.Persistent.Database.StoreDbContext;
using Store.Persistent.Implementation;
using Store.Persistent.Storage.Minio;

namespace Store.Persistent;

public static class Configuration
{
    public static IServiceCollection ConfigurationStorePersistent(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<StoreDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("StoreDb"));
        });
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IAttributeRepository, AttributeRepository>();
        services.AddScoped<IFileRepository, FileRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<ISellerRepository, SellerRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IMinioStorage, MinioStorage>();

        services.AddSingleton<IMinioClient>(_ =>
        {
            var endpoint = configuration["Minio:Endpoint"];
            var accessKey = configuration["Minio:AccessKey"];
            var secretKey = configuration["Minio:SecretKey"];
            var useSsl = bool.Parse(configuration["Minio:UseSsl"] ?? "false");
            return new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(accessKey, secretKey)
                .WithSSL(useSsl)
                .Build();
        });

        return services;
    }
}
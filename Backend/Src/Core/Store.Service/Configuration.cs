using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using Store.Service.Accounts;
using Store.Service.Attributes;
using Store.Service.Categories;
using Store.Service.Files;
using Store.Service.Products;

namespace Store.Service;

public static class Configuration
{
    public static IServiceCollection ConfigurationStoreService(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<CategoryService>();
        services.AddScoped<ProductService>();
        services.AddScoped<AttributeService>();
        services.AddScoped<FileService>();
        services.AddScoped<AccountService>();
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
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Store.Service.EntityService;
using Store.Service.ProviderService;

namespace Store.Service;

public static class Configuration
{
    public static IServiceCollection ConfigurationStoreService(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<KavenegarOptions>(configuration.GetSection(KavenegarOptions.SectionName));
        services.AddHttpClient<KavenegarSmsService>(client =>
            client.BaseAddress = new Uri("https://api.kavenegar.com/"));
        services.AddScoped<CategoryService>();
        services.AddScoped<ProductService>();
        services.AddScoped<AttributeService>();
        services.AddScoped<FileService>();
        services.AddScoped<AccountService>();
        services.AddScoped<SellerService>();
        services.AddScoped<InvoiceService>();
        return services;
    }
}

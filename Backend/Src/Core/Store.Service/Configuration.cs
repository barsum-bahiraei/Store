using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Store.Domain.Accounts;
using Store.Service.ProviderService;

namespace Store.Service;

public static class Configuration
{
    public static IServiceCollection ConfigurationStoreService(this IServiceCollection services)
    {
        services.AddScoped<CategoryService>();
        services.AddScoped<ProductService>();
        services.AddScoped<AttributeService>();
        services.AddScoped<FileService>();
        services.AddScoped<AccountService>();
        services.AddScoped<SellerService>();
        services.AddScoped<IPasswordHasher<UserEntity>, PasswordHasher<UserEntity>>();

        return services;
    }
}
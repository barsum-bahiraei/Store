using Microsoft.Extensions.DependencyInjection;
using Store.Service.Attributes;
using Store.Service.Categories;
using Store.Service.Products;

namespace Store.Service;

public static class Configuration
{
    public static IServiceCollection ConfigurationStoreService(this IServiceCollection services)
    {
        services.AddScoped<CategoryService>();
        services.AddScoped<ProductService>();
        services.AddScoped<AttributeService>();
        return services;
    }
}
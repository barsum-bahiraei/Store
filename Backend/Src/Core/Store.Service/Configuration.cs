using Store.Service.Products;
using Microsoft.Extensions.DependencyInjection;

namespace Store.Service;
public static class Configuration
{
    public static IServiceCollection RegisterStoreService(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        return services;
    }
}

using Service.Products;
using Microsoft.Extensions.DependencyInjection;

namespace Service;
public static class Configuration
{
    public static IServiceCollection RegisterService(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        return services;
    }
}

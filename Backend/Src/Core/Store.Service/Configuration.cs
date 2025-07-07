using Store.Service.Products;
using Microsoft.Extensions.DependencyInjection;
using Store.Service.Categories;
using Store.Service.Users;

namespace Store.Service;

public static class Configuration
{
    public static IServiceCollection RegisterStoreService(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IUserService, UserService>();
        return services;
    }
}
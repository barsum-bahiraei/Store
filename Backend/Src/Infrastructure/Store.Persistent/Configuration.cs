using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Store.Domain.Attribute;
using Store.Domain.Categories;
using Store.Domain.Files;
using Store.Domain.Products;
using Store.Persistent.Database.Sql;
using Store.Persistent.implementation;

namespace Store.Persistent;

public static class Configuration
{
    public static IServiceCollection ConfigurationStorePersistent(this IServiceCollection services,IConfiguration configuration)
    {
        services.AddDbContext<StoreDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("StoreDb"));
        });
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IAttributeRepository, AttributeRepository>();
        services.AddScoped<IFileRepository, FileRepository>();
        return services;
    }
}
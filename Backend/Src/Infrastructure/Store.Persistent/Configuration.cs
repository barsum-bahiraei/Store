using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Store.Domain.Attribute;
using Store.Domain.Categories;
using Store.Persistent.Database.Sql;
using Store.Persistent.implementation;
using Store.Service.Products;

namespace Store.Persistent;

public static class Configuration
{
    public static IServiceCollection ConfigurationStorePersistent(this IServiceCollection services)
    {
        services.AddDbContext<StoreDbContext>(options =>
        {
            options.UseSqlServer(
                "Server=localhost,1433;Database=StoreDb;User Id=sa;Password=DataB@se@1234;TrustServerCertificate=True;");
        });
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IAttributeRepository, AttributeRepository>();
        return services;
    }
}
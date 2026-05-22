using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Store.Domain.Categories;
using Store.Persistent.Database.Sql;
using Store.Persistent.implementation;

namespace Store.Persistent;

public static class Configuration
{
    public static IServiceCollection ConfigurationStorePersistent(this IServiceCollection services)
    {
        services.AddDbContext<StoreDbContext>(options =>
        {
            options.UseSqlServer("Server=localhost;Database=StoreDb;User Id=sa;Password=DataB@se@1234;TrustServerCertificate=True;");
        });
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        return services;
    }
}

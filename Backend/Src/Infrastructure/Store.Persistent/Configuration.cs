﻿using Store.Domain.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Store.Domain.Categories;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;
using Store.Persistent.Implementation;

namespace Store.Persistent;

public static class Configuration
{
    public static IServiceCollection RegisterStorePersistent(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();

        return services;
    }
}
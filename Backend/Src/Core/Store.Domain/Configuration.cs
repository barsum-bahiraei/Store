using Microsoft.Extensions.DependencyInjection;

namespace Store.Domain;
public static class Configuration
{
    public static IServiceCollection RegisterStoreDomain(this IServiceCollection services)
    {
        return services;
    }
}

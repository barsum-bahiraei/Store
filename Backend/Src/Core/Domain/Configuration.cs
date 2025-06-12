using Microsoft.Extensions.DependencyInjection;

namespace Domain;
public static class Configuration
{
    public static IServiceCollection RegisterDomain(this IServiceCollection services)
    {
        return services;
    }
}

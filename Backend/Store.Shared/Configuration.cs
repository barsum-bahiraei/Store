using Microsoft.Extensions.DependencyInjection;

namespace Store.Shared;

public static class Configuration
{
    public static IServiceCollection RegisterStoreShared(this IServiceCollection services)
    {
        return services;
    }
}

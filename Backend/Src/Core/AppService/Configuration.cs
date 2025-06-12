using Microsoft.Extensions.DependencyInjection;

namespace Service;
public static class Configuration
{
    public static IServiceCollection RegisterService(this IServiceCollection services)
    {
        return services;
    }
}

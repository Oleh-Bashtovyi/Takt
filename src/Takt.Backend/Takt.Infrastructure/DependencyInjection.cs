using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Takt.Domain.Repositories;
using Takt.Infrastructure.Persistence;
using Takt.Infrastructure.Persistence.Interceptors;
using Takt.Infrastructure.Persistence.Repositories;

namespace Takt.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

        services.AddSingleton<AuditableInterceptor>();

        services.AddDbContext<AppDbContext>((sp, options) =>
            options
                .UseSqlServer(connectionString)
                .AddInterceptors(sp.GetRequiredService<AuditableInterceptor>()));

        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ITodoTaskRepository, TodoTaskRepository>();

        return services;
    }
}

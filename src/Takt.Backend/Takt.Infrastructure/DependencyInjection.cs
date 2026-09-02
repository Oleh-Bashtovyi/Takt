using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Takt.Application.Auth;
using Takt.Domain.Entities;
using Takt.Domain.Repositories;
using Takt.Infrastructure.Auth;
using Takt.Infrastructure.Persistence;
using Takt.Infrastructure.Persistence.Interceptors;
using Takt.Infrastructure.Persistence.Repositories;

namespace Takt.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

        services.AddSingleton<AuditableInterceptor>();

        services.AddDbContext<AppDbContext>((sp, options) =>
            options
                .UseSqlServer(connectionString)
                .AddInterceptors(sp.GetRequiredService<AuditableInterceptor>()));

        services.AddIdentityCore<User>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = AuthConstants.PasswordMinLength;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddEntityFrameworkStores<AppDbContext>();

        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ITodoTaskRepository, TodoTaskRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        return services;
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddPersistence(configuration);

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .Validate(o => !string.IsNullOrWhiteSpace(o.Secret) && o.Secret.Length >= 32, "Jwt:Secret must be at least 32 characters.")
            .ValidateOnStart();

        services.AddScoped<ITokenService, TokenService>();

        return services;
    }
}

using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Takt.Application.Auth;
using Takt.Application.Categories;
using Takt.Application.Tasks;

namespace Takt.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ITodoTaskService, TodoTaskService>();
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}

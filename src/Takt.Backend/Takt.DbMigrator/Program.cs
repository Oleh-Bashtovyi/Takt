using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Takt.DbMigrator;
using Takt.Infrastructure;
using Takt.Infrastructure.Persistence;

// A bare "seed-data" arg triggers the dev seeder; strip it so the config providers,
// which only understand "--key value" pairs, don't choke on it.
const string SeedArg = "seed-data";
var shouldSeed = args.Contains(SeedArg);
var hostArgs = args.Where(arg => arg != SeedArg).ToArray();

// Reuse Takt.API's configuration so the connection string lives in one place.
var apiDirectory = ResolveApiDirectory();

// Must run before the host is built — DotNetEnv only sets process environment variables.
var envFile = Path.Combine(apiDirectory, ".env");
if (File.Exists(envFile))
{
    DotNetEnv.Env.NoClobber().Load(envFile);
}

var builder = Host.CreateApplicationBuilder(hostArgs);

builder.Configuration
    .AddJsonFile(Path.Combine(apiDirectory, "appsettings.json"), optional: true)
    .AddJsonFile(Path.Combine(apiDirectory, $"appsettings.{builder.Environment.EnvironmentName}.json"), optional: true)
    .AddEnvironmentVariables()
    .AddCommandLine(hostArgs);

builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddScoped<DevDataSeeder>();

var host = builder.Build();

using var scope = host.Services.CreateScope();
var services = scope.ServiceProvider;
var logger = services.GetRequiredService<ILogger<Program>>();

try
{
    var database = services.GetRequiredService<AppDbContext>().Database;

    logger.LogInformation("Applying database migrations...");
    await database.MigrateAsync();
    logger.LogInformation("Migrations applied.");

    if (shouldSeed)
    {
        await services.GetRequiredService<DevDataSeeder>().SeedAsync();
    }
}
catch (Exception ex)
{
    // Non-zero exit fails the compose "migrator" dependency so the API never starts against a broken database.
    logger.LogCritical(ex, "Database initialization failed.");
    Environment.Exit(1);
}

Environment.Exit(0);

static string ResolveApiDirectory()
{
    var directory = new DirectoryInfo(AppContext.BaseDirectory);

    while (directory is not null && !Directory.Exists(Path.Combine(directory.FullName, "Takt.API")))
    {
        directory = directory.Parent;
    }

    if (directory is null)
    {
        throw new DirectoryNotFoundException("Could not locate the 'Takt.API' directory to load its configuration.");
    }

    return Path.Combine(directory.FullName, "Takt.API");
}

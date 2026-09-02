using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Takt.Domain.Entities;
using Takt.Domain.Enums;
using Takt.Infrastructure.Persistence;

namespace Takt.DbMigrator;

internal sealed class DevDataSeeder(
    AppDbContext context,
    UserManager<User> userManager,
    ILogger<DevDataSeeder> logger)
{
    private const string DemoEmail = "demo@takt.local";
    private const string DemoPassword = "Password1";

    public async Task SeedAsync()
    {
        // Idempotent — a re-run against a populated database does nothing.
        if (await context.Users.AnyAsync())
        {
            logger.LogInformation("Seed skipped — the database already has users.");
            return;
        }

        var user = new User { UserName = DemoEmail, Email = DemoEmail, DisplayName = "Demo User" };
        var creation = await userManager.CreateAsync(user, DemoPassword);
        if (!creation.Succeeded)
        {
            logger.LogWarning(
                "Seed aborted — could not create the demo user: {Errors}",
                string.Join(", ", creation.Errors.Select(e => e.Description)));
            return;
        }

        var work = Category.Create(user.Id, "Work");
        var personal = Category.Create(user.Id, "Personal");
        context.Categories.AddRange(work, personal);

        context.Tasks.AddRange(
            TodoTask.Create(user.Id, "Write the README", null, TaskPriority.High, null, work.Id, TodoStatus.InProgress),
            TodoTask.Create(user.Id, "Review the pull request", "Check the auth changes", TaskPriority.Medium, null, work.Id, TodoStatus.Todo),
            TodoTask.Create(user.Id, "Buy groceries", null, TaskPriority.Low, null, personal.Id, TodoStatus.Todo));

        await context.SaveChangesAsync();
        logger.LogInformation("Seed complete — demo account {Email} / {Password}", DemoEmail, DemoPassword);
    }
}

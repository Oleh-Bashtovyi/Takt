using Microsoft.AspNetCore.Identity;
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

    private static readonly TaskPriority[] Priorities =
        [TaskPriority.Low, TaskPriority.Medium, TaskPriority.High];

    public async Task SeedAsync()
    {
        // Idempotent — keyed on the demo account, so it still runs when other users exist.
        if (await userManager.FindByEmailAsync(DemoEmail) is not null)
        {
            logger.LogInformation("Seed skipped — {Email} already exists.", DemoEmail);
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

        var quickWins = Category.Create(user.Id, "Quick wins");
        var longName = Category.Create(
            user.Id,
            "Home renovation, landscaping & the never-ending basement + garage cleanout");
        var backlog = Category.Create(user.Id, "Backlog");
        context.Categories.AddRange(quickWins, longName, backlog);

        context.Tasks.AddRange(BuildTasks(user.Id, quickWins.Id, "Quick win", 2));
        context.Tasks.AddRange(BuildTasks(user.Id, longName.Id, "Renovation step", 25, completeEvery: 5));
        context.Tasks.AddRange(BuildTasks(user.Id, backlog.Id, "Backlog item", 105));

        await context.SaveChangesAsync();
        logger.LogInformation(
            "Seed complete — {Email} / {Password}, 3 categories, {Tasks} tasks.",
            DemoEmail, DemoPassword, 2 + 25 + 105);
    }

    private static IEnumerable<TodoTask> BuildTasks(
        Guid userId, Guid categoryId, string prefix, int count, int completeEvery = 0)
    {
        for (var i = 1; i <= count; i++)
        {
            var priority = Priorities[i % Priorities.Length];
            DateTime? dueDate = i % 4 == 0 ? DateTime.UtcNow.AddDays(i % 21 - 7) : null;
            var description = i % 3 == 0 ? $"Follow-up notes for {prefix.ToLowerInvariant()} {i}." : null;

            var task = TodoTask.Create(userId, $"{prefix} {i:D3}", description, priority, dueDate, categoryId);
            if (completeEvery > 0 && i % completeEvery == 0)
            {
                task.SetCompleted(true);
            }

            yield return task;
        }
    }
}

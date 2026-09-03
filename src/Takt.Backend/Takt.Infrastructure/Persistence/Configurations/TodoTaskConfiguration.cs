using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Takt.Domain.Constants;
using Takt.Domain.Entities;

namespace Takt.Infrastructure.Persistence.Configurations;

internal sealed class TodoTaskConfiguration : IEntityTypeConfiguration<TodoTask>
{
    public void Configure(EntityTypeBuilder<TodoTask> builder)
    {
        builder.ToTable("Tasks");

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(TodoTaskConstants.TitleMaxLength);

        builder.Property(t => t.Description)
            .HasMaxLength(TodoTaskConstants.DescriptionMaxLength);

        builder.Ignore(t => t.IsCompleted);

        builder.Property(t => t.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(t => t.Category)
            .WithMany()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(t => new { t.UserId, t.CompletedAtUtc });
        builder.HasIndex(t => new { t.UserId, t.CategoryId });
    }
}

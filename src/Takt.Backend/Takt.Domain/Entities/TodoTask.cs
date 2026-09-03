using Takt.Domain.Common;
using Takt.Domain.Enums;

namespace Takt.Domain.Entities;

public class TodoTask : BaseEntity
{
    public string Title { get; private set; } = null!;
    public string? Description { get; private set; }
    public TaskPriority Priority { get; private set; }
    public DateTime? DueDateUtc { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Category? Category { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }

    public bool IsCompleted => CompletedAtUtc is not null;

    private TodoTask() { }

    public static TodoTask Create(
        Guid userId,
        string title,
        string? description,
        TaskPriority priority,
        DateTime? dueDateUtc,
        Guid? categoryId)
    {
        return new TodoTask
        {
            UserId = userId,
            Title = title,
            Description = description,
            Priority = priority,
            DueDateUtc = dueDateUtc,
            CategoryId = categoryId,
        };
    }

    public void Update(
        string title,
        string? description,
        TaskPriority priority,
        DateTime? dueDateUtc,
        Guid? categoryId)
    {
        Title = title;
        Description = description;
        Priority = priority;
        DueDateUtc = dueDateUtc;
        CategoryId = categoryId;
    }

    public void SetCompleted(bool completed)
    {
        CompletedAtUtc = completed ? CompletedAtUtc ?? DateTime.UtcNow : null;
    }
}

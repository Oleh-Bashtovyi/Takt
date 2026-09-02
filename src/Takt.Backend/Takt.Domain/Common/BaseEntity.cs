namespace Takt.Domain.Common;

public abstract class BaseEntity : IAuditable
{
    public Guid Id { get; protected set; } = Guid.CreateVersion7();
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }
}

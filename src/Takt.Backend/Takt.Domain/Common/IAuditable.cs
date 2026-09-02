namespace Takt.Domain.Common;

public interface IAuditable
{
    DateTime CreatedAtUtc { get; }
    DateTime UpdatedAtUtc { get; }
}

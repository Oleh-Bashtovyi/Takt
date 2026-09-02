using Takt.Domain.Common;

namespace Takt.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = null!;
    public Guid UserId { get; private set; }

    private Category() { }

    public static Category Create(Guid userId, string name)
    {
        return new Category
        {
            UserId = userId,
            Name = name,
        };
    }

    public void Rename(string name) => Name = name;
}

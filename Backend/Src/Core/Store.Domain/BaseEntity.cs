namespace Store.Domain;

public abstract class BaseEntity : BaseEntity<int>
{
}

public abstract class BaseEntity<T>
{
    public T Id { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

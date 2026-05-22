using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Domain;

public abstract class BaseEntity
{

}

public abstract class BaseEntity<T>
{
    public T Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

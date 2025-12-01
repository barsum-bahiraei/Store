using Store.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Categories;

public class CategoryAttributeEntity : BaseEntity
{
    public int CategoryId { get; set; }
    public CategoryEntity Category { get; set; }
    public int AttributeId { get; set; }
    public AttributeEntity Attribute { get; set; }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Categories;

public class CategoryEntity : BaseEntity
{
    public string Name { get; set; }
    public int? ParentId { get; set; }
    public CategoryEntity? Parent { get; set; }
    public List<CategoryEntity> Categories { get; set; }
    public List<CategoryAttributeEntity> CategoryAttributes { get; set; }
}

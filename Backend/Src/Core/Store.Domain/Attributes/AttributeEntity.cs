using Store.Domain.Categories;
using Store.Domain.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Attributes;

public class AttributeEntity : BaseEntity
{
    public string Name { get; set; }
    public string Type { get; set; }
    public string Unit { get; set; }
    public List<CategoryAttributeEntity> CategoryAttributes { get; set; }
    public List<ProductAttributeEntity> ProductAttributes { get; set; }
}

using Store.Domain.Categories;
using Store.Domain.Products;
using Store.Shared.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Attributes;

public class AttributeEntity : BaseEntity
{
    public string Name { get; set; }
    public AttributeTypeEnum Type { get; set; }
    public AttributeUnitEnum Unit { get; set; }
    public List<CategoryAttributeEntity> CategoryAttributes { get; set; }
    public List<ProductAttributeEntity> ProductAttributes { get; set; }
}

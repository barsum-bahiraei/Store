using System;
using System.Collections.Generic;
using System.Text;
using Store.Service.Products;

namespace Store.Domain.Categories;

public class CategoryEntity : BaseEntity
{
    public string Title { get; set; }
    public ICollection<CategoryAttributeEntity> CategoryAttributes { get; set; }
    public ICollection<ProductEntity> Products { get; set; }
}
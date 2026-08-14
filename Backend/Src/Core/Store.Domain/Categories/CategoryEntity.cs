using System;
using System.Collections.Generic;
using System.Text;
using Store.Domain.Products;

namespace Store.Domain.Categories;

public class CategoryEntity : BaseEntity
{
    public string Title { get; set; }
    public int? ParentId { get; set; }
    public CategoryEntity? Parent { get; set; }
    public ICollection<CategoryEntity>? Children { get; set; }
    public ICollection<CategoryAttributeEntity> CategoryAttributes { get; set; }
    public ICollection<ProductEntity> Products { get; set; }
}
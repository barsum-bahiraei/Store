using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Domain.Categories.Models.Output;

public class CategoryListOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? ParentId { get; set; }
    public List<CategoryListOutput>? Children { get; set; }
}

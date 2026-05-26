using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Domain.Categories;

public class ProductEntity : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string MainImageUrl { get; set; }
    public string CategoryId { get; set; }
    public CategoryEntity Category { get; set; }
}

public class FilesEntity : BaseEntity
{
    public string FileUrl { get; set; }
    public AttributeFileTypeEnum FileType { get; set; }
    public string TableName { get; set; }//TODO: Enum Or TableId
    public int TargetId { get; set; }// TODO: ProductId = 12
}

public class CategoryEntity : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    //public ICollection<ProductEntity> Products { get; set; }    
}
public enum AttributeFileTypeEnum
{
    Image = 1,
    Pdf = 2,
}
public enum AttributeUnitEnum
{
    Number = 1,
    KilloGram = 2,
    Litr = 3,
    Gram = 4,
}
public class AttributeEntity : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    public AttributeUnitEnum Unit { get; set; }

}
public class CategoryJunkAttributeEntity : BaseEntity
{
    public CategoryEntity Category { get; set; }
    public AttributeEntity Attribute { get; set; }
}

public class ProductAttributeValue
{
    public ProductEntity Product { get; set; }
    public AttributeEntity Attribute { get; set; }
    public string AttributeValue { get; set; }
}




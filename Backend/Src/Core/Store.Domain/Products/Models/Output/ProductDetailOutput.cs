using Store.Domain.Attribute;
using Store.Domain.Files;
using Store.Service.Attributes;

namespace Store.Domain.Products.Models.Output;

public class ProductDetailOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryTitle { get; set; }
    public List<ProductCategoryDetailOutput> Categories { get; set; }
    public ProductSellerDetailOutput Seller { get; set; }
    public List<ProductImageDetailOutput> Images { get; set; }
    public List<ProductAttributeDetailOutput> Attributes { get; set; }
    public List<ProductCommentDetailOutput> Comments { get; set; }
}

public class ProductCategoryDetailOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? ParentId { get; set; }
}

public class ProductAttributeDetailOutput
{
    public int Id { get; set; }
    public int AttributeId { get; set; }
    public string? AttributeTitle { get; set; }
    public string Value { get; set; }
    public AttributeUnitEnum AttributeUnit { get; set; }
    public AttributeTypeEnum AttributeType { get; set; }
}

public class ProductImageDetailOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}

public class ProductSellerDetailOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class ProductCommentDetailOutput
{
    public int Id { get; set; }
    public string Text { get; set; }
    public byte? Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public ProductCommentUserDetailOutput User { get; set; }
}

public class ProductCommentUserDetailOutput
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

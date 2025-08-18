﻿namespace Store.Domain.Products;

public class ProductEntity : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public List<ProductImageEntity> ProductImages { get; set; }
    public List<ProductAttributeEntity> ProductAttributes { get; set; }
    public List<ProductColorEntity> ProductColors { get; set; }
    public List<ProductCommentEntity> ProductComments { get; set; }
}
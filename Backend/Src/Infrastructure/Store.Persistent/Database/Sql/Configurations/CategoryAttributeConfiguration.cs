using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Categories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Persistent.Database.Sql.Configurations;

public class CategoryAttributeConfiguration : IEntityTypeConfiguration<CategoryAttributeEntity>
{
    public void Configure(EntityTypeBuilder<CategoryAttributeEntity> builder)
    {
        builder.ToTable("CategoryAttribute");

        builder
            .HasOne(x => x.Category)
            .WithMany(x => x.CategoryAttributes)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(x => x.Attribute)
            .WithMany(x => x.CategoryAttributes)
            .HasForeignKey(x => x.AttributeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

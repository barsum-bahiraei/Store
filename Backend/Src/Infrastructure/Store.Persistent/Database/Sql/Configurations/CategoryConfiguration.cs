using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Categories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Persistent.Database.Sql.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<CategoryEntity>
{
    public void Configure(EntityTypeBuilder<CategoryEntity> builder)
    {
        builder.ToTable("Categories");
        builder.Property(x => x.Name).IsRequired();
        builder.Property(x => x.ParentId).IsRequired(false);
        builder
            .HasOne(x => x.Parent)
            .WithMany(x => x.Categories)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
        //builder   
        //    .HasMany(x => x.CategoryAttributes)
        //    .WithOne(x => x.Category)
        //    .HasForeignKey(x => x.CategoryId);
        //builder
        //    .HasMany(x => x.Products)
        //    .WithOne(x => x.Category)
        //    .HasForeignKey(x => x.CategoryId);
    }
}

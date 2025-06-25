using Store.Domain.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Persistent.Database.Sql.Configurations;
internal class ProductConfigurattion : IEntityTypeConfiguration<ProductEntiry>
{
    public void Configure(EntityTypeBuilder<ProductEntiry> builder)
    {
        builder.ToTable("Products");
    }
}

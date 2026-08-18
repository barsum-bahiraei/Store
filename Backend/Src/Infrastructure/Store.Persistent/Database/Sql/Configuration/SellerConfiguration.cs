using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Sellers;

namespace Store.Persistent.Database.Sql.Configuration;

public class SellerConfiguration : IEntityTypeConfiguration<SellerEntity>
{
    public void Configure(EntityTypeBuilder<SellerEntity> builder)
    {
        builder.ToTable("Sellers");
        builder.HasOne(x => x.User)
            .WithMany(x => x.Sellers)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Invoices;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class PreInvoiceConfiguration : IEntityTypeConfiguration<PreInvoiceEntity>
{
    public void Configure(EntityTypeBuilder<PreInvoiceEntity> builder)
    {
        builder.ToTable("PreInvoices");

        builder.HasOne(x => x.Product)
            .WithMany(x => x.PreInvoices)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.User)
            .WithMany(x => x.PreInvoices)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
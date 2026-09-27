using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Invoices;

namespace Store.Persistent.Database.StoreDbContext.Configuration;

public class PaymentConfiguration : IEntityTypeConfiguration<PaymentEntity>
{
    public void Configure(EntityTypeBuilder<PaymentEntity> builder)
    {
        builder.ToTable("Payments");
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(18, 2);
        builder.Property(x => x.RefId).HasMaxLength(100);
        builder.Property(x => x.CardHolderPan).HasMaxLength(32);
        builder.Property(x => x.PayResponseCode).HasMaxLength(10);
        builder.Property(x => x.CallbackResponseCode).HasMaxLength(10);
        builder.Property(x => x.VerifyResponseCode).HasMaxLength(10);
        builder.Property(x => x.SettleResponseCode).HasMaxLength(10);
        builder.HasIndex(x => x.OrderId).IsUnique();
        builder.HasIndex(x => x.RefId);

        builder.HasOne(x => x.Invoice)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Store.Domain;
using Store.Domain.Accounts;
using Store.Domain.Attribute;
using Store.Domain.Categories;
using Store.Domain.Files;
using Store.Domain.Products;
using Store.Domain.Sellers;

namespace Store.Persistent.Database.Sql;

public class StoreDbContext : DbContext
{
    public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options)
    {
    }

    public DbSet<ProductEntity> Products { get; set; }
    public DbSet<ProductAttributeEntity> ProductAttributes { get; set; }
    public DbSet<CategoryEntity> Categoryies { get; set; }
    public DbSet<CategoryAttributeEntity> CategoryAttributes { get; set; }
    public DbSet<AttributeEntity> Attributes { get; set; }
    public DbSet<FileEntity> Files { get; set; }
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<RoleEntity> Roles { get; set; }
    public DbSet<UserRoleEntity> UserRoles { get; set; }
    public DbSet<RoleAccessEntity> RoleAccess { get; set; }
    public DbSet<SellerEntity> Sellers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StoreDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker
            .Entries<BaseEntity>();
        var now = DateTime.UtcNow;

        foreach (EntityEntry<BaseEntity> entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;

                // جلوگیری از تغییر CreatedAt
                entry.Property(x => x.CreatedAt).IsModified = false;
            }
        }
    }
}
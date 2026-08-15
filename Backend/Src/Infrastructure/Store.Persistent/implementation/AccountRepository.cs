using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class AccountRepository(StoreDbContext context) : IAccountRepository
{
    public async Task<List<UserEntity>> ListAsync(CancellationToken cancellation)
    {
        var result = await context.Users.ToListAsync(cancellation);
        return result;
    }

    public async Task<UserEntity?> GetAsync(int id, CancellationToken cancellation = default)
    {
        var result = await context.Users.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<UserEntity> CreateAsync(UserEntity input, CancellationToken cancellation = default)
    {
        await context.Users.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<UserEntity> UpdateAsync(UserEntity input, CancellationToken cancellation = default)
    {
        context.Users.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation = default)
    {
        var result = await context.Roles.ToListAsync(cancellation);
        return result;
    }

    public async Task<RoleEntity?> RoleGetAsync(int id, CancellationToken cancellation = default)
    {
        var result = await context.Roles.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<RoleEntity> RoleCreateAsync(RoleEntity input, CancellationToken cancellation = default)
    {
        await context.Roles.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<RoleEntity> RoleUpdateAsync(RoleEntity input, CancellationToken cancellation = default)
    {
        context.Roles.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task RoleDeleteAsync(RoleEntity input, CancellationToken cancellation = default)
    {
        context.Roles.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }
}
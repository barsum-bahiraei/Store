using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class AccountRepository(StoreDbContext context) : IAccountRepository
{
    public async Task<List<UserEntity>> UserListAsync(CancellationToken cancellation)
    {
        var result = await context.Users.ToListAsync(cancellation);
        return result;
    }

    public async Task<UserEntity?> UserGetAsync(string email, CancellationToken cancellation = default)
    {
        var result = await context.Users.FirstOrDefaultAsync(x => x.Email == email, cancellation);
        return result;
    }

    public async Task<UserEntity> UserCreateAsync(UserEntity input, CancellationToken cancellation = default)
    {
        await context.Users.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<UserEntity> UserUpdateAsync(UserEntity input, CancellationToken cancellation = default)
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

    public async Task<List<RoleAccessEntity>> RoleAccessListAsync(CancellationToken cancellation = default)
    {
        var result = await context.RoleAccess.ToListAsync(cancellation);
        return result;
    }

    public async Task<RoleAccessEntity?> RoleAccessGetAsync(int id, CancellationToken cancellation = default)
    {
        var result = await context.RoleAccess.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<RoleAccessEntity> RoleAccessCreateAsync(RoleAccessEntity input,
        CancellationToken cancellation = default)
    {
        await context.RoleAccess.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task RoleAccessDeleteAsync(RoleAccessEntity input, CancellationToken cancellation = default)
    {
        context.RoleAccess.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }
}
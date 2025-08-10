using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;
using System.Security;

namespace Store.Persistent.Implementation;

public class AccountRepository(AppDbContext context) : IAccountRepository
{
    public async Task<UserEntity> CreateAsync(UserEntity input, CancellationToken cancellation)
    {
        await context.Users.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<UserEntity> DetailAsync(string email, CancellationToken cancellation)
    {
        var output = await context.Users.FirstOrDefaultAsync(x => x.Email == email, cancellation);
        return output;
    }

    public async Task<bool> HasUserAsync(string email, CancellationToken cancellation)
    {
        return await context.Users.AnyAsync(x => x.Email == email, cancellation);
    }

    public async Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation)
    {
        var roles = await context.Roles
            .Distinct()
            .OrderBy(x => x.Id)
            .ToListAsync(cancellation);
        return roles;
    }

    public async Task<RoleEntity> RoleCreateAsync(RoleEntity input, CancellationToken cancellation)
    {
        await context.Roles.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public Task<List<RoleAccessEntity>> UserRoleAccessListAsync(string email, CancellationToken cancellation)
    {
        var output = context.UserRoles
            .Where(x => x.User.Email == email)
            .SelectMany(x => x.Role.RoleAccess)
            .ToListAsync(cancellation);
        return output;
    }

    public Task<List<RoleEntity>> RoleAccessListAsync(CancellationToken cancellation)
    {
        var output = context.Roles.Include(x => x.RoleAccess).ToListAsync(cancellation);
        return output;
    }

    public async Task AccessListAsignRoleAsync(List<RoleAccessEntity> input, CancellationToken cancellation)
    {
        await context.RoleAccess.AddRangeAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task RoleAssignUserAsync(UserRoleEntity input, CancellationToken cancellation)
    {
        await context.UserRoles.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
    }
}
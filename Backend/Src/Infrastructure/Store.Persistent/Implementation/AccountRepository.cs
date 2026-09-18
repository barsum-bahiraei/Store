using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class AccountRepository(StoreDbContext context) : IAccountRepository
{
    public async Task<List<UserEntity>> UserListAsync(UserListInput input, CancellationToken cancellation)
    {
        var query = context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(input.FirstName))
            query = query.Where(x => x.FirstName.Contains(input.FirstName.Trim()));

        if (!string.IsNullOrWhiteSpace(input.LastName))
            query = query.Where(x => x.LastName.Contains(input.LastName.Trim()));

        if (!string.IsNullOrWhiteSpace(input.Email))
            query = query.Where(x => x.Email.Contains(input.Email.Trim()));

        if (!string.IsNullOrWhiteSpace(input.PhoneNumber))
            query = query.Where(x => x.PhoneNumber != null && x.PhoneNumber.Contains(input.PhoneNumber.Trim()));

        if (!string.IsNullOrWhiteSpace(input.BirthDate))
            query = query.Where(x => x.BirthDate != null && x.BirthDate.Contains(input.BirthDate.Trim()));

        if (input.Gender.HasValue)
            query = query.Where(x => x.Gender == input.Gender.Value);

        var result = await query.OrderBy(x => x.Id).ToListAsync(cancellation);
        return result;
    }

    public async Task<UserEntity?> UserGetAsync(string email, CancellationToken cancellation = default)
    {
        var result = await context.Users.FirstOrDefaultAsync(x => x.Email == email, cancellation);
        return result;
    }

    public async Task<UserEntity?> UserGetAsync(int id, CancellationToken cancellation = default)
    {
        var result = await context.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
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
        var result = await context.Roles
            .Include(x => x.RoleAccess)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
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

    public async Task<UserRoleEntity?> UserRoleGetAsync(int id, CancellationToken cancellation = default)
    {
        var result = await context.UserRoles.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<UserRoleEntity> UserRoleCreateAsync(UserRoleEntity input,
        CancellationToken cancellation = default)
    {
        await context.UserRoles.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task UserRoleDeleteAsync(UserRoleEntity input, CancellationToken cancellation = default)
    {
        context.UserRoles.Remove(input);
        await context.SaveChangesAsync(cancellation);
    }

    public async Task<List<RoleAccessEntity>> RoleAccessListAsync(CancellationToken cancellation = default)
    {
        var result = await context.RoleAccess.ToListAsync(cancellation);
        return result;
    }

    public async Task<List<RoleAccessEntity>> RoleAccessListAsync(int roleId, CancellationToken cancellation = default)
    {
        var result = await context.RoleAccess
            .Where(x => x.RoleId == roleId)
            .ToListAsync(cancellation);
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
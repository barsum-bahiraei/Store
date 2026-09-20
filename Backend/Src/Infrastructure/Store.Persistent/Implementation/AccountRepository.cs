using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class AccountRepository(StoreDbContext context) : IAccountRepository
{
    public async Task<List<UserEntity>> UserListAsync(UserListInput input, CancellationToken cancellation)
    {
        var query = context.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(input.FirstName))
            query = query.Where(x => x.FirstName != null && x.FirstName.Contains(input.FirstName.Trim()));

        if (!string.IsNullOrWhiteSpace(input.LastName))
            query = query.Where(x => x.LastName != null && x.LastName.Contains(input.LastName.Trim()));

        if (!string.IsNullOrWhiteSpace(input.Email))
            query = query.Where(x => x.Email != null && x.Email.Contains(input.Email.Trim()));

        if (!string.IsNullOrWhiteSpace(input.PhoneNumber))
            query = query.Where(x => x.PhoneNumber != null && x.PhoneNumber.Contains(input.PhoneNumber.Trim()));

        if (!string.IsNullOrWhiteSpace(input.BirthDate))
            query = query.Where(x => x.BirthDate != null && x.BirthDate.Contains(input.BirthDate.Trim()));

        if (input.Gender.HasValue)
            query = query.Where(x => x.Gender == input.Gender.Value);

        var result = await query.OrderBy(x => x.Id).ToListAsync(cancellation);
        return result;
    }

    public async Task<List<UserEntity>> UserListAsync(IReadOnlyCollection<int> ids,
        CancellationToken cancellation = default)
    {
        return await context.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellation);
    }

    public async Task<UserEntity?> UserGetByPhoneNumberAsync(string phoneNumber,
        CancellationToken cancellation = default)
    {
        var result = await context.Users.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber, cancellation);
        return result;
    }

    public async Task<UserEntity?> UserGetByEmailAsync(string email, CancellationToken cancellation = default)
    {
        return await context.Users.FirstOrDefaultAsync(x => x.Email == email, cancellation);
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

    public async Task<VerificationCodeEntity?> VerificationCodeReplaceAsync(VerificationCodeEntity input,
        CancellationToken cancellation = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellation);
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtextextended({input.PhoneNumber}, 0))",
            cancellation);

        var now = DateTime.UtcNow;
        var canSend = !await context.VerificationCodes.AnyAsync(
            x => x.PhoneNumber == input.PhoneNumber &&
                 !x.IsUsed &&
                 x.ExpiresAt > now,
            cancellation);
        if (!canSend)
            return null;

        await context.VerificationCodes
            .Where(x => x.PhoneNumber == input.PhoneNumber && !x.IsUsed)
            .ExecuteUpdateAsync(x => x.SetProperty(item => item.IsUsed, true), cancellation);
        await context.VerificationCodes.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        await transaction.CommitAsync(cancellation);
        return input;
    }

    public async Task VerificationCodeInvalidateAsync(int id, CancellationToken cancellation = default)
    {
        await context.VerificationCodes
            .Where(x => x.Id == id && !x.IsUsed)
            .ExecuteUpdateAsync(x => x.SetProperty(item => item.IsUsed, true), cancellation);
    }

    public async Task<VerificationCodeEntity?> VerificationCodeGetAsync(string phoneNumber,
        CancellationToken cancellation = default)
    {
        return await context.VerificationCodes
            .AsNoTracking()
            .Where(x => x.PhoneNumber == phoneNumber && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellation);
    }

    public async Task<(UserEntity User, bool IsNewUser)?> VerificationCodeUseAsync(
        int id,
        string phoneNumber,
        string roleName,
        CancellationToken cancellation = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellation);
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtextextended({phoneNumber}, 0))",
            cancellation);

        var affectedRows = await context.VerificationCodes
            .Where(x => x.Id == id && x.PhoneNumber == phoneNumber && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
            .ExecuteUpdateAsync(x => x.SetProperty(item => item.IsUsed, true), cancellation);
        if (affectedRows != 1)
            return null;

        await context.VerificationCodes
            .Where(x => x.PhoneNumber == phoneNumber && !x.IsUsed)
            .ExecuteUpdateAsync(x => x.SetProperty(item => item.IsUsed, true), cancellation);

        var user = await context.Users.FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber, cancellation);
        var isNewUser = user == null;
        if (user == null)
        {
            user = new UserEntity
            {
                PhoneNumber = phoneNumber,
                Gender = GenderTypeEnum.unknown,
                IsPhoneNumberVerified = true
            };
            await context.Users.AddAsync(user, cancellation);
            await context.SaveChangesAsync(cancellation);

            var roleLockKey = $"default-role:{roleName}";
            await context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(hashtextextended({roleLockKey}, 0))",
                cancellation);
            var normalizedRoleName = roleName.ToLower();
            var role = await context.Roles.FirstOrDefaultAsync(
                x => x.Name.ToLower() == normalizedRoleName,
                cancellation);
            if (role == null)
            {
                role = new RoleEntity { Name = roleName };
                await context.Roles.AddAsync(role, cancellation);
                await context.SaveChangesAsync(cancellation);
            }

            await context.UserRoles.AddAsync(new UserRoleEntity
            {
                UserId = user.Id,
                RoleId = role.Id
            }, cancellation);
        }
        else
        {
            user.IsPhoneNumberVerified = true;
        }

        await context.SaveChangesAsync(cancellation);
        await transaction.CommitAsync(cancellation);
        return (user, isNewUser);
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

    public async Task<List<DiscountCodeEntity>> DiscountCodeListAsync(
        CancellationToken cancellation = default)
    {
        return await context.DiscountCodes
            .Include(x => x.UserDiscountCodes)
            .OrderByDescending(x => x.Id)
            .ToListAsync(cancellation);
    }

    public async Task<DiscountCodeEntity?> DiscountCodeGetAsync(int id,
        CancellationToken cancellation = default)
    {
        return await context.DiscountCodes
            .Include(x => x.UserDiscountCodes)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellation);
    }

    public async Task<bool> DiscountCodeExistsAsync(string code, int? excludedId,
        CancellationToken cancellation = default)
    {
        var normalizedCode = code.ToLower();
        return await context.DiscountCodes.AnyAsync(
            x => x.Code.ToLower() == normalizedCode && (!excludedId.HasValue || x.Id != excludedId.Value),
            cancellation);
    }

    public async Task<DiscountCodeEntity> DiscountCodeCreateAsync(DiscountCodeEntity input,
        CancellationToken cancellation = default)
    {
        await context.DiscountCodes.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<DiscountCodeEntity> DiscountCodeUpdateAsync(DiscountCodeEntity input,
        CancellationToken cancellation = default)
    {
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<bool> DiscountCodeIsUsedAsync(int id, CancellationToken cancellation = default)
    {
        return await context.Invoices.AnyAsync(x => x.DiscountCodeId == id, cancellation);
    }

    public async Task DiscountCodeDeleteAsync(DiscountCodeEntity input,
        CancellationToken cancellation = default)
    {
        context.DiscountCodes.Remove(input);
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

using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public class AccountService(IAccountRepository accountRepository)
{
    public async Task<Result<List<UserListOutput>>> UserListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.UserListAsync(cancellation);
        var result = entities.Select(x => new UserListOutput
        {
            Id = x.Id,
            FirstName = x.FirstName,
            LastName = x.LastName,
            Email = x.Email,
            BirthDate = x.BirthDate,
            Address = x.Address,
            Gender = x.Gender,
            PhoneNumber = x.PhoneNumber,
            NationalCode = x.NationalCode,
            IsEmailVerified = x.IsEmailVerified,
        }).ToList();
        return Result<List<UserListOutput>>.Success(result);
    }

    public async Task<Result<UserGetOutput>> UserGetAsync(string email, CancellationToken cancellation)
    {
        var entity = await accountRepository.UserGetAsync(email, cancellation);
        if (entity == null)
        {
            return Result<UserGetOutput>.Failure("User not found");
        }

        var result = new UserGetOutput
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            BirthDate = entity.BirthDate,
            Address = entity.Address,
            Gender = entity.Gender,
            PhoneNumber = entity.PhoneNumber,
            NationalCode = entity.NationalCode,
            IsEmailVerified = entity.IsEmailVerified,
        };
        return Result<UserGetOutput>.Success(result);
    }

    public async Task<Result<List<RoleListOutput>>> RoleListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.RoleListAsync(cancellation);
        var result = entities.Select(x => new RoleListOutput
        {
            Id = x.Id,
            Name = x.Name,
        }).ToList();
        return Result<List<RoleListOutput>>.Success(result);
    }

    public async Task<Result<RoleGetOutput>> RoleGetAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<RoleGetOutput>.Failure("Role not found");
        }

        var result = new RoleGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
        };
        return Result<RoleGetOutput>.Success(result);
    }

    public async Task<Result<RoleCreateOutput>> RoleCreateAsync(RoleCreateInput input, CancellationToken cancellation)
    {
        var entity = new RoleEntity
        {
            Name = input.Name,
        };
        var created = await accountRepository.RoleCreateAsync(entity, cancellation);
        var result = new RoleCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
        };
        return Result<RoleCreateOutput>.Success(result);
    }

    public async Task<Result<RoleUpdateOutput>> RoleUpdateAsync(int id, RoleUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<RoleUpdateOutput>.Failure("Role not found");
        }

        entity.Name = input.Name;
        var result = new RoleUpdateOutput
        {
            Id = entity.Id,
            Name = entity.Name,
        };
        return Result<RoleUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> RoleDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<bool>.Failure("Role not found");
        }

        await accountRepository.RoleDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<List<RoleAccessListOutput>>> RoleAccessListAsync(CancellationToken cancellation)
    {
        var entities = await accountRepository.RoleAccessListAsync(cancellation);
        var result = entities.Select(x => new RoleAccessListOutput
        {
            Id = x.Id,
            RoleId = x.RoleId,
            ControllerName = x.ControllerName,
            ActionName = x.ActionName,
        }).ToList();
        return Result<List<RoleAccessListOutput>>.Success(result);
    }

    public async Task<Result<RoleAccessCreateOutput>> RoleAccessCreateAsync(RoleAccessCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new RoleAccessEntity
        {
            ControllerName = input.ControllerName,
            ActionName = input.ActionName,
            RoleId = input.RoleId,
        };
        var created = await accountRepository.RoleAccessCreateAsync(entity, cancellation);
        var result = new RoleAccessCreateOutput
        {
            Id = created.Id,
            ControllerName = created.ControllerName,
            ActionName = created.ActionName,
            RoleId = created.RoleId,
        };
        return Result<RoleAccessCreateOutput>.Success(result);
    }

    public async Task<Result<bool>> RoleAccessDeleteAsync(int id, CancellationToken cancellation)
    {
        var entity = await accountRepository.RoleAccessGetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<bool>.Failure("Role Access not found");
        }

        await accountRepository.RoleAccessDeleteAsync(entity, cancellation);
        return Result<bool>.Success(true);
    }
}
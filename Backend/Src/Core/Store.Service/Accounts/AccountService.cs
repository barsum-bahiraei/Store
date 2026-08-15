using Store.Domain.Accounts;
using Store.Domain.Accounts.Models.Input;
using Store.Domain.Accounts.Models.Output;

namespace Store.Service.Accounts;

public class AccountService(IAccountRepository accountRepository)
{
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
}
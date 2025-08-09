namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<UserEntity> DetailAsync(string email, CancellationToken cancellation);
    Task<UserEntity> CreateAsync(UserEntity parameters, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);
    Task<RoleEntity> RoleCreateAsync(RoleEntity parameters, CancellationToken cancellation);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation);
    Task AccessCreateAsync(AccessEntity parameters, CancellationToken cancellation);
    Task<List<AccessEntity>> AccessListAsync(CancellationToken cancellation);
    Task<List<AccessEntity>> UserAccessListAsync(string email, CancellationToken cancellation);
    Task AccesssAssignRoleAsync(int RoleId, List<int> parameters, CancellationToken cancellation);
}
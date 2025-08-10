namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<UserEntity> DetailAsync(string email, CancellationToken cancellation);
    Task<UserEntity> CreateAsync(UserEntity parameters, CancellationToken cancellation);
    Task<RoleEntity> RoleCreateAsync(RoleEntity parameters, CancellationToken cancellation);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation);
    Task<List<RoleAccessEntity>> UserRoleAccessListAsync(string email, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);

}
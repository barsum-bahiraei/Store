using Store.Domain.Accounts.Models.Input;

namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<List<UserEntity>> UserListAsync(UserListInput input, CancellationToken cancellation);
    Task<UserEntity?> UserGetByEmailAsync(string email, CancellationToken cancellation);
    Task<UserEntity?> UserGetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellation);
    Task<UserEntity?> UserGetAsync(int id, CancellationToken cancellation);
    Task<UserEntity> UserCreateAsync(UserEntity input, CancellationToken cancellation);
    Task<UserEntity> UserUpdateAsync(UserEntity input, CancellationToken cancellation);
    Task<VerificationCodeEntity?> VerificationCodeReplaceAsync(VerificationCodeEntity input,
        CancellationToken cancellation);
    Task VerificationCodeInvalidateAsync(int id, CancellationToken cancellation);
    Task<VerificationCodeEntity?> VerificationCodeGetAsync(string phoneNumber, CancellationToken cancellation);
    Task<(UserEntity User, bool IsNewUser)?> VerificationCodeUseAsync(int id, string phoneNumber, string roleName,
        CancellationToken cancellation);
    Task<List<RoleEntity>> RoleListAsync(CancellationToken cancellation);
    Task<RoleEntity?> RoleGetAsync(int id, CancellationToken cancellation);
    Task<RoleEntity> RoleCreateAsync(RoleEntity input, CancellationToken cancellation);
    Task<RoleEntity> RoleUpdateAsync(RoleEntity input, CancellationToken cancellation);
    Task RoleDeleteAsync(RoleEntity input, CancellationToken cancellation);
    Task<UserRoleEntity?> UserRoleGetAsync(int id, CancellationToken cancellation);
    Task<UserRoleEntity> UserRoleCreateAsync(UserRoleEntity input, CancellationToken cancellation);
    Task UserRoleDeleteAsync(UserRoleEntity input, CancellationToken cancellation);
    Task<List<RoleAccessEntity>> RoleAccessListAsync(CancellationToken cancellation);
    Task<List<RoleAccessEntity>> RoleAccessListAsync(int roleId,CancellationToken cancellation);
    Task<RoleAccessEntity?> RoleAccessGetAsync(int id, CancellationToken cancellation);
    Task<RoleAccessEntity> RoleAccessCreateAsync(RoleAccessEntity input, CancellationToken cancellation);
    Task RoleAccessDeleteAsync(RoleAccessEntity input, CancellationToken cancellation);
}

namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<List<UserEntity>> ListAsync(CancellationToken cancellation = default);
    Task<UserEntity?> GetAsync(int id, CancellationToken cancellation = default);
    Task<UserEntity> CreateAsync(UserEntity input, CancellationToken cancellation = default);
    Task<UserEntity> UpdateAsync(UserEntity input, CancellationToken cancellation = default);
}
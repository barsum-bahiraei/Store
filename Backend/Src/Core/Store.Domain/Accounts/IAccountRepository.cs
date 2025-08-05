namespace Store.Domain.Accounts;

public interface IAccountRepository
{
    Task<UserEntity> DetailAsync(string email, CancellationToken cancellation);
    Task<UserEntity> CreateAsync(UserEntity parameters, CancellationToken cancellation);
    Task<bool> HasUserAsync(string email, CancellationToken cancellation);
}
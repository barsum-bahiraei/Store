using Microsoft.EntityFrameworkCore;
using Store.Domain.Accounts;
using Store.Persistent.Database.Sql;

namespace Store.Persistent.implementation;

public class AccountRepository(StoreDbContext context) : IAccountRepository
{
    public async Task<List<UserEntity>> ListAsync(CancellationToken cancellation)
    {
        var result = await context.Users.ToListAsync(cancellation);
        return result;
    }

    public async Task<UserEntity?> GetAsync(int id, CancellationToken cancellation = default)
    {
        var result = await context.Users.FirstOrDefaultAsync(x => x.Id == id, cancellation);
        return result;
    }

    public async Task<UserEntity> CreateAsync(UserEntity input, CancellationToken cancellation = default)
    {
        await context.Users.AddAsync(input, cancellation);
        await context.SaveChangesAsync(cancellation);
        return input;
    }

    public async Task<UserEntity> UpdateAsync(UserEntity input, CancellationToken cancellation = default)
    {
        context.Users.Update(input);
        await context.SaveChangesAsync(cancellation);
        return input;
    }
}
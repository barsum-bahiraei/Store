namespace Store.Domain.Sellers;

public interface ISellerRepository
{
    Task<List<SellerEntity>> ListAsync(int userId, CancellationToken cancellation);
    Task<SellerEntity?> GetAsync(int id, int userId, CancellationToken cancellation);
    Task<SellerEntity> CreateAsync(SellerEntity input, CancellationToken cancellation);
    Task<SellerEntity> UpdateAsync(SellerEntity input, CancellationToken cancellation);
    Task DeleteAsync(SellerEntity input, CancellationToken cancellation);
}
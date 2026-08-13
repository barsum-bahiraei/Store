namespace Store.Domain.Attribute;

public interface IAttributeRepository
{
    Task<List<AttributeEntity>> ListAsync(CancellationToken cancellation);
    Task<AttributeEntity?> GetAsync(int id, CancellationToken cancellation);
    Task<AttributeEntity> CreateAsync(AttributeEntity input, CancellationToken cancellation);
    Task<AttributeEntity> UpdateAsync(AttributeEntity input, CancellationToken cancellation);
    Task DeleteAsync(int id, CancellationToken cancellation);
}
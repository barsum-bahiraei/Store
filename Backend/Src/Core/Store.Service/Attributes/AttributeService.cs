using Store.Domain.Attribute;
using Store.Domain.Attribute.Models.Input;
using Store.Domain.Attribute.Models.Output;

namespace Store.Service.Attributes;

public class AttributeService(IAttributeRepository attributeRepository)
{
    public async Task<Result<List<AttributeListOutput>>> ListAsync(CancellationToken cancellation)
    {
        var entities = await attributeRepository.ListAsync(cancellation);

        var result = entities.Select(x => new AttributeListOutput
        {
            Title = x.Title,
            Type = x.Type,
            Unit = x.Unit,
        }).ToList();
        return Result<List<AttributeListOutput>>.Success(result);
    }


    public async Task<Result<AttributeListOutput>> GetAsync(int id, CancellationToken cancellation)
    {
        var entity = await attributeRepository.GetAsync(id, cancellation);

        var result = new AttributeListOutput
        {
            Title = entity.Title,
            Type = entity.Type,
            Unit = entity.Unit,
        };
        return Result<AttributeListOutput>.Success(result);
    }


    public async Task<Result<AttributeListOutput>> CreateAsync(CreateAttributeInput input, CancellationToken cancellation)
    {
        var entity = new AttributeEntity
        {
            Title = input.Title,
            Type = input.Type,
            Unit = input.Unit
        };
        var created = await attributeRepository.CreateAsync(entity, cancellation);

        var result = new AttributeListOutput
        {
            Title = created.Title,
            Type = created.Type,
            Unit = created.Unit
        };
        return Result<AttributeListOutput>.Success(result);
    }


    public async Task<Result<AttributeListOutput>> UpdateAsync(int id, UpdateAttributeInput input, CancellationToken cancellation)
    {
        var entity = new AttributeEntity
        {
            Id = id,
            Title = input.Title,
            Type = input.Type,
            Unit = input.Unit
        };
        var updated = await attributeRepository.UpdateAsync(entity, cancellation);

        var result = new AttributeListOutput
        {
            Title = updated.Title,
            Type = updated.Type,
            Unit = updated.Unit
        };
        return Result<AttributeListOutput>.Success(result);
    }


    public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellation)
    {
        await attributeRepository.DeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
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
            Id = x.Id,
            Name = x.Name,
            Type = x.Type,
            Unit = x.Unit,
        }).ToList();
        return Result<List<AttributeListOutput>>.Success(result);
    }


    public async Task<Result<AttributeGetOutput?>> GetAsync(int id, CancellationToken cancellation)
    {
        var entity = await attributeRepository.GetAsync(id, cancellation);
        if (entity == null)
        {
            return Result<AttributeGetOutput?>.Failure("Attribute not found!");
        }

        var result = new AttributeGetOutput
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = entity.Type,
            Unit = entity.Unit,
        };
        return Result<AttributeGetOutput?>.Success(result);
    }


    public async Task<Result<AttributeCreateOutput>> CreateAsync(AttributeCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new AttributeEntity
        {
            Name = input.Name,
            Type = input.Type,
            Unit = input.Unit
        };
        var created = await attributeRepository.CreateAsync(entity, cancellation);

        var result = new AttributeCreateOutput
        {
            Id = created.Id,
            Name = created.Name,
            Type = created.Type,
            Unit = created.Unit
        };
        return Result<AttributeCreateOutput>.Success(result);
    }


    public async Task<Result<AttributeUpdateOutput>> UpdateAsync(int id, AttributeUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = new AttributeEntity
        {
            Id = id,
            Name = input.Name,
            Type = input.Type,
            Unit = input.Unit
        };
        var updated = await attributeRepository.UpdateAsync(entity, cancellation);

        var result = new AttributeUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            Type = updated.Type,
            Unit = updated.Unit
        };
        return Result<AttributeUpdateOutput>.Success(result);
    }


    public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellation)
    {
        await attributeRepository.DeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
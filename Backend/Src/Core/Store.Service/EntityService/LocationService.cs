using Store.Domain.Locations;
using Store.Domain.Locations.Models.Output;

namespace Store.Service.EntityService;

public class LocationService(ILocationRepository locationRepository)
{
    public async Task<Result<List<LocationListOutput>>> ProvinceListAsync(CancellationToken cancellation)
    {
        var entities = await locationRepository.ProvinceListAsync(cancellation);
        return Result<List<LocationListOutput>>.Success(entities.Select(x => new LocationListOutput
        {
            Id = x.Id,
            Name = x.Name
        }).ToList());
    }

    public async Task<Result<List<LocationListOutput>>> CityListAsync(int provinceId, CancellationToken cancellation)
    {
        if (provinceId <= 0)
            return Result<List<LocationListOutput>>.Failure("استان نامعتبر است");

        var entities = await locationRepository.CityListAsync(provinceId, cancellation);
        return Result<List<LocationListOutput>>.Success(entities.Select(x => new LocationListOutput
        {
            Id = x.Id,
            Name = x.Name
        }).ToList());
    }
}

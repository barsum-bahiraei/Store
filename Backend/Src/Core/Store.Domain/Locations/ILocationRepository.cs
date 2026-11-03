namespace Store.Domain.Locations;

public interface ILocationRepository
{
    Task<List<ProvinceEntity>> ProvinceListAsync(CancellationToken cancellation = default);
    Task<List<CityEntity>> CityListAsync(int provinceId, CancellationToken cancellation = default);
    Task<CityEntity?> CityGetAsync(int provinceId, int cityId, CancellationToken cancellation = default);
}

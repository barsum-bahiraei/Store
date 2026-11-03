using Microsoft.EntityFrameworkCore;
using Store.Domain.Locations;
using Store.Persistent.Database.StoreDbContext;

namespace Store.Persistent.Implementation;

public class LocationRepository(StoreDbContext context) : ILocationRepository
{
    public Task<List<ProvinceEntity>> ProvinceListAsync(CancellationToken cancellation = default) =>
        context.Provinces.AsNoTracking().OrderBy(x => x.Name).ToListAsync(cancellation);

    public Task<List<CityEntity>> CityListAsync(int provinceId, CancellationToken cancellation = default) =>
        context.Cities.AsNoTracking()
            .Where(x => x.ProvinceId == provinceId)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellation);

    public Task<CityEntity?> CityGetAsync(int provinceId, int cityId, CancellationToken cancellation = default) =>
        context.Cities.AsNoTracking()
            .Include(x => x.Province)
            .FirstOrDefaultAsync(x => x.Id == cityId && x.ProvinceId == provinceId, cancellation);
}

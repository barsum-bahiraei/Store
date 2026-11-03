using Store.Domain.Accounts;

namespace Store.Domain.Locations;

public class ProvinceEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<CityEntity> Cities { get; set; } = [];
    public ICollection<UserEntity> Users { get; set; } = [];
}

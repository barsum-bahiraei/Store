using Store.Domain.Accounts;

namespace Store.Domain.Locations;

public class CityEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ProvinceId { get; set; }
    public ProvinceEntity Province { get; set; } = null!;
    public ICollection<UserEntity> Users { get; set; } = [];
}

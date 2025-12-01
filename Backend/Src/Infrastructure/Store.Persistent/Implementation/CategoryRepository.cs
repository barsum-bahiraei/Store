using Store.Domain.Categories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Persistent.Implementation;

public class CategoryRepository : ICategoryRepository
{
    public Task<List<CategoryEntity>> ListAsync(CancellationToken cancellation)
    {
        throw new NotImplementedException();
    }
}

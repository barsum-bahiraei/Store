using Store.Domain.Categories;
using Store.Domain.Categories.Models.Output;
using System;
using System.Collections.Generic;
using System.Text;
using Store.Domain.Categories.Models.Input;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository)
{
    public async Task<Result<List<CategoryListOutput>>> ListAsync(CancellationToken cancellation)
    {
        var categoryEntityList = await categoryRepository.ListAsync(cancellation);
        var result = categoryEntityList.Select(x => new CategoryListOutput
        {
            Id = x.Id,
            Title = x.Title
        }).ToList();

        return Result<List<CategoryListOutput>>.Success(result);
    }

    public async Task<Result<CategoryGetOutput>> GetAsync(int id, CancellationToken cancellation)
    {
        var eniity = await categoryRepository.GetAsync(id, cancellation);
        var result = new CategoryGetOutput
        {
            Id = eniity.Id,
            Title = eniity.Title
        };
        return Result<CategoryGetOutput>.Success(result);
    }

    public async Task<Result<CategoryCreateOutput>> CreateAsync(CategoryCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new CategoryEntity
        {
            Title = input.Title
        };
        var created = await categoryRepository.CreateAsync(entity, cancellation);
        var result = new CategoryCreateOutput
        {
            Id = created.Id,
            Title = input.Title
        };
        return Result<CategoryCreateOutput>.Success(result);
    }

    public async Task<Result<CategoryUpdateOutput>> UpdateAsync(int id, CategoryUpdateInput input,        CancellationToken cancellation)
    {
        var entity = new CategoryEntity
        {
            Id = id,
            Title = input.Title
        };
        var updated = await categoryRepository.UpdateAsync(entity, cancellation);
        var result = new CategoryUpdateOutput
        {
            Id = updated.Id,
            Title = updated.Title
        };
        return Result<CategoryUpdateOutput>.Success(result);
    }

    public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellation)
    {
        await categoryRepository.DeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }

    public async Task<Result<List<CategoryAttributeListOutput>>> AttributeListAsync(int categoryId,
        CancellationToken cancellation)
    {
        var entityList = await categoryRepository.AttributeListAsync(categoryId, cancellation);
        var result = entityList.Select(x => new CategoryAttributeListOutput
            {
                CategoryId = x.Category.Id,
                CategoryTitle = x.Category.Title,
                AttributeId = x.Attribute.Id,
                AttributeTitle = x.Attribute.Title
            })
            .ToList();
        return Result<List<CategoryAttributeListOutput>>.Success(result);
    }

    public async Task<Result<CategoryAttributeAddOutput>> AttributeAddAsync(CategoryAttributeAddInput input,
        CancellationToken cancellation)
    {
        var entity = new CategoryAttributeEntity
        {
            CategoryId = input.CategoryId,
            AttributeId = input.AttributeId
        };
        var created = await categoryRepository.AttributeAddAsync(entity, cancellation);
        var result = new CategoryAttributeAddOutput
        {
            CategoryId = created.Category.Id,
            CategoryTitle = created.Category.Title,
            AttributeId = created.Attribute.Id,
            AttributeTitle = created.Attribute.Title
        };
        return Result<CategoryAttributeAddOutput>.Success(result);
    }

    public async Task<Result<bool>> AttributeDeleteAsync(int id, CancellationToken cancellation)
    {
        await categoryRepository.AttributeDeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
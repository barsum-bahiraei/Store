using Store.Domain.Categories;
using Store.Domain.Categories.Models.Output;
using System;
using System.Collections.Generic;
using System.Text;
using Store.Domain.Attribute;
using Store.Domain.Categories.Models.Input;

namespace Store.Service.Categories;

public class CategoryService(ICategoryRepository categoryRepository, IAttributeRepository attributeRepository)
{
    private List<CategoryListOutput> BuildTree(List<CategoryEntity> categories, int? parentId)
    {
        return categories
            .Where(x => x.ParentId == parentId)
            .Select(x => new CategoryListOutput
            {
                Id = x.Id,
                Name = x.Name,
                ParentId = x.ParentId,
                Children = BuildTree(categories, x.Id)
            }).ToList();
    }

    public async Task<Result<List<CategoryListOutput>>> ListAsync(CancellationToken cancellation)
    {
        var categoryEntityList = await categoryRepository.ListAsync(cancellation);
        var result = BuildTree(categoryEntityList, null);

        return Result<List<CategoryListOutput>>.Success(result);
    }

    public async Task<Result<CategoryGetOutput?>> GetAsync(int id, CancellationToken cancellation)
    {
        var eniity = await categoryRepository.GetAsync(id, cancellation);
        if (eniity == null)
        {
            return Result<CategoryGetOutput?>.Failure("Category not found!");
        }

        var result = new CategoryGetOutput
        {
            Id = eniity.Id,
            Name = eniity?.Name,
            ParentId = eniity?.ParentId
        };
        return Result<CategoryGetOutput?>.Success(result);
    }

    public async Task<Result<CategoryCreateOutput>> CreateAsync(CategoryCreateInput input,
        CancellationToken cancellation)
    {
        var entity = new CategoryEntity
        {
            Name = input.Name,
            ParentId = input.ParentId,
        };
        var created = await categoryRepository.CreateAsync(entity, cancellation);
        var result = new CategoryCreateOutput
        {
            Id = created.Id,
            Name = input.Name,
            ParentId = input.ParentId,
        };
        return Result<CategoryCreateOutput>.Success(result);
    }

    public async Task<Result<CategoryUpdateOutput>> UpdateAsync(int id, CategoryUpdateInput input,
        CancellationToken cancellation)
    {
        var entity = new CategoryEntity
        {
            Id = id,
            Name = input.Name,
            ParentId = input.ParentId
        };
        var updated = await categoryRepository.UpdateAsync(entity, cancellation);
        var result = new CategoryUpdateOutput
        {
            Id = updated.Id,
            Name = updated.Name,
            ParentId = updated.ParentId,
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
                Id = x.Id,
                AttributeId = x.Attribute.Id,
                AttributeTitle = x.Attribute.Name,
                AttributeUnit = x.Attribute.Unit,
                AttributeType = x.Attribute.Type,
            })
            .ToList();
        return Result<List<CategoryAttributeListOutput>>.Success(result);
    }

    public async Task<Result<CategoryAttributeAddOutput>> AttributeAddAsync(CategoryAttributeAddInput input,
        CancellationToken cancellation)
    {
        var categoryAttributeEntity =
            await categoryRepository.AttributeGetAsync(input.CategoryId, input.AttributeId, cancellation);
        if (categoryAttributeEntity != null)
        {
            return Result<CategoryAttributeAddOutput>.Failure("parameters is exist!");
        }

        var categoryEntity = await categoryRepository.GetAsync(input.CategoryId, cancellation);
        if (categoryEntity == null)
        {
            return Result<CategoryAttributeAddOutput>.Failure("parameters is not exist!");
        }

        var attributeEntity = await attributeRepository.GetAsync(input.AttributeId, cancellation);
        if (attributeEntity == null)
        {
            return Result<CategoryAttributeAddOutput>.Failure("parameters is not exist!");
        }

        var entity = new CategoryAttributeEntity
        {
            CategoryId = input.CategoryId,
            AttributeId = input.AttributeId
        };

        var created = await categoryRepository.AttributeAddAsync(entity, cancellation);
        var result = new CategoryAttributeAddOutput
        {
            Id = created.Id,
            AttributeId = created.Attribute.Id,
            AttributeTitle = created.Attribute.Name,
            AttributeType = created.Attribute.Type,
            AttributeUnit = created.Attribute.Unit,
        };
        return Result<CategoryAttributeAddOutput>.Success(result);
    }

    public async Task<Result<bool>> AttributeDeleteAsync(int id, CancellationToken cancellation)
    {
        await categoryRepository.AttributeDeleteAsync(id, cancellation);
        return Result<bool>.Success(true);
    }
}
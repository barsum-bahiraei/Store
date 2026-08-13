namespace Store.Domain.Files;

public class FileEntity : BaseEntity
{
    public string Url { get; set; }
    public string TableName { get; set; }
    public int TargetId { get; set; }
    public string TargetName { get; set; }
    public AttributeFileTypeEnum FileType { get; set; }
    public FileFieldTypeEnum FieldType { get; set; }
}
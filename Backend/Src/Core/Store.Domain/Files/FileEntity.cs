namespace Store.Domain.Files;

public class FileEntity : BaseEntity
{
    public string Url { get; set; }
    public string TableName { get; set; }
    public string TargetId { get; set; }
    public AttributeFileTypeEnum FileType { get; set; }
}
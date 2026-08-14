namespace Store.Domain.Files;

public class FileEntity : BaseEntity
{
    public string Title { get; set; }
    public string Url { get; set; }
    public TableNameEnum TableName { get; set; }
    public int TargetId { get; set; }
    public TargetNameEnum TargetName { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}
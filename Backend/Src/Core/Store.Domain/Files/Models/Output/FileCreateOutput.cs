namespace Store.Domain.Files.Models.Output;

public class FileCreateOutput
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public TableNameEnum TableName { get; set; }
    public int TargetId { get; set; }
    public TargetNameEnum TargetName { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}
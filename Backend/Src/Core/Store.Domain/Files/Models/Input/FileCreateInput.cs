namespace Store.Domain.Files.Models.Input;

public class FileCreateInput
{
    public string Name { get; set; }
    public TableNameEnum TableName { get; set; }
    public int TargetId { get; set; }
    public TargetNameEnum TargetName { get; set; }
    public bool IsMain { get; set; }
    public FileTypeEnum FileType { get; set; }
}
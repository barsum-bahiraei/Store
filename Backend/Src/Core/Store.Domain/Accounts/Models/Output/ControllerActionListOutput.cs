namespace Store.Domain.Accounts.Models.Output;

public class ControllerActionListOutput
{
    public string ControllerName { get; set; }
    public List<string> ActionsName { get; set; }
}
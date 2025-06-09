namespace StoreBackend.Helpers.Models;

public class ResponseViewModel
{
    public short code { set; get; } = 200;
    public string? Message { set; get; } = null;
    public object? Data { set; get; } = null;
}

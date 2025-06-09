using StoreBackend.Helpers.Models;

namespace StoreBackend.Helpers;

public static class ResponseHelper
{
    public static ResponseViewModel Success(object? data)
    {
        return new ResponseViewModel
        {
            code = 200,
            Message = null,
            Data = data
        };
    }

    public static ResponseViewModel Error(short code, string message, object? data)
    {
        return new ResponseViewModel
        {
            code = code,
            Message = message,
            Data = data
        };
    }
}

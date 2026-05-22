using System;
using System.Collections.Generic;
using System.Text;

namespace Store.Service;

public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public static Result<T> Success(T? data) => new() { IsSuccess = true, Data = data };
    public static Result<T> Failure(string message) => new() { IsSuccess = false, ErrorMessage = message };
}

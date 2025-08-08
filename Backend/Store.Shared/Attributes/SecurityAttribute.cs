using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Store.Service.Accounts;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Store.Shared.Attributes
{
    public class SecurityAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string permissionName;

        public SecurityAttribute(string permissionName)
        {
            this.permissionName = permissionName;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            try
            {
                var user = context.HttpContext.User;
                if (user == null || !user.Identity.IsAuthenticated)
                {
                    // کاربر احراز هویت نشده
                    context.Result = new ForbidResult();
                    return;
                }

                var email = user.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email))
                {
                    // ایمیل موجود نیست یا نامعتبر است
                    context.Result = new ForbidResult();
                    return;
                }

                var userService = context.HttpContext.RequestServices.GetService<IAccountService>();
                if (userService == null)
                {
                    // سرویس در دسترس نیست
                    context.Result = new ForbidResult();
                    return;
                }

                var permissions = await userService.UserPermissionListAsync(email, context.HttpContext.RequestAborted);
                if (permissions == null || !permissions.Any(p => p.Name == permissionName))
                {
                    // دسترسی لازم وجود ندارد
                    context.Result = new ForbidResult();
                    return;
                }
            }
            catch (OperationCanceledException)
            {
                // اگر درخواست لغو شد، دسترسی رد شود
                context.Result = new ForbidResult();
            }
            catch (Exception ex)
            {
                // اینجا می‌توانید لاگ بگیرید یا به هر روش مناسب با خطا برخورد کنید
                // برای جلوگیری از نشت اطلاعات دسترسی رد می‌شود
                context.Result = new ForbidResult();
            }
        }
    }
}

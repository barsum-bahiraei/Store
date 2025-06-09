// services/axiosInstances.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

/**
 * تولید یک اینسنس Axios با baseURL و تنظیمات اولیه
 */
function makeInstance(baseURL: string): AxiosInstance {
    const config: AxiosRequestConfig = {
        baseURL,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 10000,
    };

    const instance = axios.create(config);

    instance.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    //     instance.defaults.headers.common["Client-Path"] = window.location.href;

    instance.interceptors.request.use(
        (req) => {
            // اگر لازم است توکن خاصی برای هر بزک‌اند اضافه شود،
            // می‌توانید اینجا بررسی کنید یا (به ازای هر instance) در کلاس مربوطه هدر اضافه کنید.
            return req;
        },
        (error: AxiosError) => Promise.reject(error)
    );

    // ====== اینترسپتور پاسخ (برای هندل کردن خطای عمومی) ======
    instance.interceptors.response.use(
        (res) => res,
        (error: AxiosError) => {
            // در اینجا می‌توانید لاگ خطا، نمایش پیغام سراسری یا ریدایرکت انجام دهید.
            return Promise.reject(error);
        }
    );

    return instance;
}

/**
 * اینجا برای هر بک‌اند یک اینسنس می‌سازیم.
 * دقت کنید حتماً متغیر محیطی از قبل تعریف شده باشد.
 */
export const storeAxios = makeInstance(process.env.NEXT_PUBLIC_STORE_API!);

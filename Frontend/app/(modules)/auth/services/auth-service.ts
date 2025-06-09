import { storeAxios } from "@/app/plugins/http-client";
import { ResponseModel } from "@/app/models/response";
import {LoginParameters, LoginViewModel, RegisterViewModel, RegisterParameters} from "@/app/(modules)/auth/models/auth-models";

export class AuthService {
    private api = storeAxios;

    public async login(params: LoginParameters): Promise<ResponseModel<LoginViewModel>> {
        const response = await this.api.post<ResponseModel<LoginViewModel>>("Auth/Login", params);
        return response.data;
    }

    public async register(params: RegisterParameters): Promise<ResponseModel<RegisterViewModel>> {
        const response = await this.api.post<ResponseModel<RegisterViewModel>>("Auth/Register", params);
        return response.data;
    }
}

export const authService = new AuthService();

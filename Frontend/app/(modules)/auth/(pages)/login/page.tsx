"use client";

import {ChangeEvent, useState} from "react";
import Image from "next/image";
import {LoginParameters, LoginViewModel} from "@/app/(modules)/auth/models/auth-models";
import {authService} from "@/app/(modules)/auth/services/auth-service";
import {useRouter} from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [params, setParams] = useState<LoginParameters>({
        email: "",
        password: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    async function login() {
        const {data}: { data: LoginViewModel } = await authService.login(params);
        window.localStorage.setItem("token", data.token);
        router.push("/");
    }

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center min-h-screen">
                <div className="w-full md:w-1/3 p-4 bg-white border border-gray-300 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Sign In
                    </h1>
                    <div className="space-y-3">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={params.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={params.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <button
                            onClick={login}
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Submit
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-2/3 flex items-center justify-center p-6">
                    <div className="w-full h-64 md:h-96 rounded-lg flex items-center justify-center">
                        <Image
                            src="/images/login.jpg"
                            alt=""
                            width={800}
                            height={800}
                            className="object-cover rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

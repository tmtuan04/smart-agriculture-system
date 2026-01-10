import { BASE_URL } from "./config";
import * as SecureStore from "expo-secure-store"

export const getMeApi = async () => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
        return {
            ok: false,
            data: { message: "Token not found" },
        };
    }

    const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    const data = await response.json();
    return {
        ok: response.ok,
        data,
    };
};

export const loginApi = async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    return response.json().then((data) => ({ ok: response.ok, data }));
};

export const signupApi = async (
    fullname: string,
    email: string,
    password: string
) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password }),
    });

    return response.json().then((data) => ({ ok: response.ok, data }));
};
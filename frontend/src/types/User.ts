export interface User {
    id: number;
    email: string;
    nickname: string;
    role: "USER" | "ADMIN";
}

export type LoginResponse = {
    accessToken: string;
    user: User;
};

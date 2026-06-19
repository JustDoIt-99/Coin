export interface User {
    id: number;
    email: string;
    nickname: string;
}

export type LoginResponse = {
    accessToken: string;
    user: User;
};
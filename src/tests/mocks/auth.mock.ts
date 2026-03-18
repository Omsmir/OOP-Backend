import { PERMISSIONS } from "@/interfaces/permissions";

export const createUserPayload = (email: string) => {
    return {
        name: 'Test User',
        email,
        age: '40',
        gender: 'male',
        role: 'user',
        password: 'password',
        permissions: [PERMISSIONS.USER_READ,PERMISSIONS.USER_CREATE,PERMISSIONS.USER_PROFILE_UPDATE],
    };
};

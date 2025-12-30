export const createUserPayload = (email: string, role: 'admin' | 'author' | 'researcher') => {
    return {
        name: 'Test User',
        email,
        age: '40',
        gender: 'male',
        role,
        password: 'password',
        permissions: ['read', 'write'],
    };
};

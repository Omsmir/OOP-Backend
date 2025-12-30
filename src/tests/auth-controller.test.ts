import { createMockDatabaseService } from '@/__tests__/mocks';
import { closeDatabase, login_request, prepareDatabase, resetDatabase } from '@/__tests__/setup';
import App from '@/app';
import authController from '@/controllers/auth.postgres.controller';

import UserRepository from '@/repository/auth.repo';
import sessionRepository from '@/repository/session.repo';
import authRoute from '@/routes/auth.post.route';
import { Client } from 'pg';
import request from 'supertest';
import { createUserPayload } from './mocks/auth.mock';
import DeserializeMiddleware from '@/middlewares/deserializeUser';

describe('auth controller tests', () => {
    let app: App;

    let client: Client;

    beforeAll(async () => {
        const { client: fresh_client } = await prepareDatabase();

        client = fresh_client;

        const DB = createMockDatabaseService(client);

        const middlewares = new DeserializeMiddleware()

        const user_repository = new UserRepository(DB);
        const session_repository = new sessionRepository(DB);

        const auth_controller = new authController(user_repository, session_repository);

        const auth_route = new authRoute(auth_controller, middlewares);

        app = App.createInstance([auth_route]);
    });

    beforeEach(async () => {
        await resetDatabase(client);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await closeDatabase(client);
    });

    describe('POST /post-users', () => {
        it("shouldn't create user with existing email", async () => {
            const existedUser = 'admin@example.com';

            const existed_user_payload = createUserPayload(existedUser, 'admin');

            const response = await request(app.getServer())
                .post('/api/v1/post-users')
                .send({ ...existed_user_payload });

            expect(response.status).toBe(403);
        });

        it('should create user successfully', async () => {
            const user_payload = createUserPayload('test@example.com', 'admin');
            const response = await request(app.getServer())
                .post('/api/v1/post-users')
                .send({ ...user_payload });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'user created successfully');

            expect(response.body).toHaveProperty('createdUser');
        });
    });

    describe('POST /post-users/login', () => {
        const existed_email = 'admin@example.com';

        it('should not login with not found credentials', async () => {
            const non_existed_email = 'test@example.com';

            const response = await login_request(app, non_existed_email, 'password');

            expect(response.status).toBe(401);

            expect(response.body).toHaveProperty('message', 'invalid email or password');
        });

        it('should not login with invalid credentials', async () => {
            const response = await login_request(app, existed_email, 'wrongpassword');

            expect(response.status).toBe(401);

            expect(response.body).toHaveProperty('message', 'invalid email or password');
        });

        it('should login user successfully and set cookies', async () => {
            const response = await login_request(app, existed_email, 'password');

            const rawCookies = response.headers['set-cookie'];

            expect(rawCookies[0]).toMatch(/refreshToken=/);

            expect(rawCookies[1]).toMatch(/accessToken=/);

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('message', 'logged in successfully');

            expect(response.body).toHaveProperty('accessToken');
        });
    });
});

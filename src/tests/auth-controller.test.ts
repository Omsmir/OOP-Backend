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
import S3, { S3Services } from '@/integrations/s3';
import { NormalUser, UserFactory } from '@/classes/creationalPatterns';
import { RedisConnection, RedisServices } from '@/utils/redis';
import BullWorkers from '@/integrations/workers';
import { AUTH_ROUTE } from './types/general.interfaces';
import { SEEDED_USER_NAME, SEEDED_USER_PASSWORD, TEST_SEEDED_EMAIL } from '@/config/defaults';

describe('auth controller tests', () => {
    let app: App;

    let client: Client;

    beforeAll(async () => {
        const { client: fresh_client } = await prepareDatabase();

        client = fresh_client;

        const DB = createMockDatabaseService(client);

        const middlewares = new DeserializeMiddleware();

        const user_repository = new UserRepository(DB);
        const session_repository = new sessionRepository(DB);

        const user_factory = new UserFactory();

        const redis = RedisConnection.getInstance().getClient();

        const redis_services = new RedisServices(redis);

        const workers = new BullWorkers();

        const s3 = S3.getInstance();

        const S3Service = new S3Services(s3);

        const auth_controller = new authController(
            user_repository,
            session_repository,
            redis_services,
            workers,
            S3Service,
            user_factory
        );

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
        it("shouldn't reach the handler if not logged in ", async () => {
            const response = await request(app.getServer()).post(AUTH_ROUTE.BASE_ROUTE).send();

            expect(response.status).toBe(401);
        });

        it('should fail if does not have the sufficient privileges', async () => {
            const login = await login_request(
                app,
                String(TEST_SEEDED_EMAIL),
                String(SEEDED_USER_PASSWORD)
            );

            const cookies = login.headers['set-cookie'];

            const accessToken = login.body.accessToken;

            const response = await request(app.getServer())
                .post(`${AUTH_ROUTE.BASE_ROUTE}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Cookie', cookies)
                .send();

            expect(response.status).toBe(403);

            expect(response.body).toHaveProperty(
                'message',
                'unsufficient privileges to perform this action'
            );
        });
        it("shouldn't create user with existing email", async () => {
            const login = await login_request(
                app,
                String(SEEDED_USER_NAME),
                String(SEEDED_USER_PASSWORD)
            );

            const cookies = login.headers['set-cookie'];

            const accessToken = login.body.accessToken;

            const existed_user_payload = await UserFactory.seeding_user({
                name: 'omar fouad',
                email: String(TEST_SEEDED_EMAIL),
                password: String(SEEDED_USER_PASSWORD),
                instance: new NormalUser(),
            });
            existed_user_payload.age = String(existed_user_payload.age) as any;

            const response = await request(app.getServer())
                .post(`${AUTH_ROUTE.BASE_ROUTE}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Cookie', cookies)
                .send({ ...existed_user_payload });

            expect(response.status).toBe(403);

            expect(response.body).toHaveProperty(
                'message',
                `user with email:${existed_user_payload.email} is already exist`
            );
        }, 15000);

        it('should create user successfully', async () => {
            const login = await login_request(
                app,
                String(SEEDED_USER_NAME),
                String(SEEDED_USER_PASSWORD)
            );

            const cookies = login.headers['set-cookie'];

            const accessToken = login.body.accessToken;

            const new_user = await UserFactory.seeding_user({
                name: 'omar fouad',
                email: String('test@example.com'),
                password: String(SEEDED_USER_PASSWORD),
                instance: new NormalUser(),
            });

            new_user.age = String(new_user.age) as any;

            const response = await request(app.getServer())
                .post(`${AUTH_ROUTE.BASE_ROUTE}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Cookie', cookies)
                .send({ ...new_user });

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty('message', 'user created successfully');

            expect(response.body).toHaveProperty('createdUser');
        },15000);
    });

    describe('POST /post-users/login', () => {
        it('should not login with not found credentials', async () => {
            const non_existed_email = 'test1@example.com';

            const response = await login_request(app, non_existed_email, 'password');

            expect(response.status).toBe(403);

            expect(response.body).toHaveProperty('message', 'invalid email or password');
        });

        it('should not login with invalid credentials', async () => {
            const response = await login_request(app, String(TEST_SEEDED_EMAIL), 'wrongpassword');

            expect(response.status).toBe(403);

            expect(response.body).toHaveProperty('message', 'invalid email or password');
        });

        it('should login user successfully and set cookies', async () => {
            const response = await login_request(
                app,
                String(TEST_SEEDED_EMAIL),
                String(SEEDED_USER_PASSWORD)
            );

            const rawCookies = response.headers['set-cookie'];

            expect(rawCookies[0]).toMatch(/refreshToken=/);

            expect(rawCookies[1]).toMatch(/accessToken=/);

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('message', 'logged in successfully');

            expect(response.body).toHaveProperty('accessToken');
        });
    });
});

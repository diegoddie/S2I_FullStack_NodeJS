import supertest from "supertest";
import { connect } from "../utils/mongoMemoryServer";
const app = require('../connection/index'); 
const mongoose = require('mongoose');

describe('user', () => {
    beforeAll(async() => {
        await connect()
    });
    
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const response = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'johndoe@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('firstName');
            expect(response.body).toHaveProperty('lastName');
            expect(response.body).toHaveProperty('email');
        });

        it('should return 400 Bad Request for an invalid user', async () => {
            const response = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'John',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 Bad Request for an invalid email input', async () => {
            const response = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'johndoeexamplecom'
                });

            expect(response.status).toBe(400);
        });

        it('should return 500 Bad Request for an email that already exists', async () => {
            const response = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'johndoe@example.com'
                });

            expect(response.status).toBe(500);
        });
    });

    describe('GET /users', () => {
        it('should return a list of users when users are present', async () => {    
            const response = await supertest(app)
                .get('/users');
    
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);

            response.body.forEach(user => {
                expect(user).toHaveProperty('_id');
                expect(user).toHaveProperty('firstName');
                expect(user).toHaveProperty('lastName');
                expect(user).toHaveProperty('email');
            });
        });

        it('should return a specific user by ID', async () => {
            const createUserResponse = await supertest(app)
                .post("/users")
                .send({
                    firstName: "John",
                    lastName: "Rawl",
                    email: "johnrawl@example.com",
                });
    
            const userId = createUserResponse.body._id;
            const response = await supertest(app)
                .get(`/users/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toEqual(userId);
        });

        it('should return an error when an ID does not exists', async () => {
            const response = await supertest(app)
                .get('/users/1');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update an existing user', async () => {
            const createUserResponse = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'Lebron',
                    lastName: 'James',
                    email: 'lebronjames@example.com'
                });
    
            const userId = createUserResponse.body._id;
    
            const updateUserResponse = await supertest(app)
                .put(`/users/${userId}`)
                .send({
                    firstName: 'The',
                    lastName: 'King',
                    email: 'updatedemail@example.com'
                });
    
            expect(updateUserResponse.status).toBe(200);
            expect(updateUserResponse.body).toHaveProperty('_id');
            expect(updateUserResponse.body.firstName).toBe('The');
            expect(updateUserResponse.body.lastName).toBe('King');
            expect(updateUserResponse.body.email).toBe('updatedemail@example.com');
        });

        it('should return error 404 if the user to update does not exist', async () => {
            const response = await supertest(app)
                .put('/users/2')
                .send({
                    firstName: 'UpdatedName'
                });
    
            expect(response.status).toBe(404);
        });

        it('should return an error if the user wants to update with an invalid email', async () => {
            const createUserResponse = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'Lebron',
                    lastName: 'James',
                    email: 'lebronjames@example.com'
                });
    
            const userId = createUserResponse.body._id;
    
            const updateUserResponse = await supertest(app)
                .put(`/users/${userId}`)
                .send({
                    firstName: 'The',
                    lastName: 'King',
                    email: 'updatedemailexample.com'
                });
    
            expect(updateUserResponse.status).toBe(400);
        });

        it('should return an error if the user wants to update with an email that already exists', async () => {
            const createUserResponse = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'Luka',
                    lastName: 'Doncic',
                    email: 'lukadoncic@example.com'
                });
    
            const userId = createUserResponse.body._id;
    
            const updateUserResponse = await supertest(app)
                .put(`/users/${userId}`)
                .send({
                    email: 'updatedemail@example.com'
                });
    
            expect(updateUserResponse.status).toBe(404);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete an existing user by ID', async () => {
            const createUserResponse = await supertest(app)
                .post('/users')
                .send({
                    firstName: 'Kawhi',
                    lastName: 'Leonard',
                    email: 'kawhi@example.com'
                });
    
            const userId = createUserResponse.body._id;
    
            const deleteUserResponse = await supertest(app)
                .delete(`/users/${userId}`);
    
            expect(deleteUserResponse.status).toBe(200);
            expect(deleteUserResponse.body[0]).toHaveProperty('_id');
            expect(deleteUserResponse.body[0]._id).toBe(userId);
        });
    
        it('should return 404 Not Found if the user to delete does not exist', async () => {    
            const response = await supertest(app)
                .delete('/users/3');
    
            expect(response.status).toBe(404);
        });

        it('should delete all users', async () => {        
            await supertest(app)
                .delete('/users');
        
            const response = await supertest(app)
                .get('/users');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0); 
        });
    });
})

import supertest from "supertest";
import { connect } from "../utils/mongoMemoryServer";
const app = require('../connection/index'); 
const mongoose = require('mongoose');

describe('swap orders', () => {
    let user1, user2, product1, product2;

    beforeAll(async() => {
        await connect()

        user1 = await supertest(app)
            .post('/users')
            .send({
                firstName: 'Paul',
                lastName: 'George',
                email: 'pg13@example.com'
            });

        user2 = await supertest(app)
            .post('/users')
            .send({
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alicesmith@example.com'
            });

        product1 = await supertest(app)
            .post('/products')
            .send({
                name: 'Product 1',
                image: ['http://example.com/image1.jpg']
            });

        product2 = await supertest(app)
            .post('/products')
            .send({
                name: 'Product 2',
                image: ['http://example.com/image2.jpg']
            });
    });
    
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('POST /swap-orders', () => {
        it('should create a new swap order', async () => {
            const response = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: [product1.body._id, product2.body._id], 
                    users: [user1.body._id, user2.body._id] 
                });

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.products).toEqual(expect.arrayContaining([product1.body._id, product2.body._id]));
            expect(response.body.users).toEqual(expect.arrayContaining([user1.body._id, user2.body._id]));
        });

        it('should return an error if the request is invalid', async () => {
            const response = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: ['invalid-product'],
                    users: ['invalid-user']
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /swap-orders', () => {
        it('should return swap orders', async () => {
            const response = await supertest(app)
                .get('/swap-orders');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);

            response.body.forEach(swapOrder => {
                expect(swapOrder).toHaveProperty('_id');
                expect(swapOrder).toHaveProperty('products');
                expect(swapOrder).toHaveProperty('users');
            });
        });

        it('should return a specific swap order by ID', async () => {
            const swapOrderResponse = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: [product1.body._id, product2.body._id],
                    users: [user1.body._id, user2.body._id]
                });
        
            const swapOrderId = swapOrderResponse.body._id;
            const response = await supertest(app)
                .get(`/swap-orders/${swapOrderId}`);
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("_id");
            expect(response.body._id).toEqual(swapOrderId);
        });

        it('should return all swap orders involving a specific user by user ID', async () => {        
            const userToFind = user1.body._id;
            const response = await supertest(app)
                .get(`/swap-orders/user/${userToFind}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);

            let found = false;
            response.body.forEach(swap => {
                const users = swap.users;

                if (users.some(user => user._id === userToFind)) {
                    found = true;
                }
            });

            expect(found).toBe(true);
        });

        it('should return all swap orders involving a specific product by product ID', async () => {
            const productToFind = product1.body._id;
            const response = await supertest(app)
                .get(`/swap-orders/product/${productToFind}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);

            let found = false;
            response.body.forEach(swap => {
                const products = swap.products;
                if (products.some(product => product._id === productToFind)) {
                    found = true;
                }
            });

            expect(found).toBe(true);
        });

        it('should return an error when a swap order ID does not exist', async () => {
            const response = await supertest(app)
                .get('/swap-orders/1');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /swap-orders/:id', () => {
        it('should update an existing swap order', async () => {
            const swapOrder = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: [product1.body._id, product2.body._id],
                    users: [user1.body._id, user2.body._id]
                });

            const swapOrderId = swapOrder.body._id;

            const response = await supertest(app)
                .put(`/swap-orders/${swapOrderId}`)
                .send({
                    products: [product2.body._id, product1.body._id],
                    users: [user2.body._id, user1.body._id]
                });

            expect(response.status).toBe(200);
        });

        it('should return an error if the request is invalid', async () => {
            const swapOrder = await supertest(app)
            .post('/swap-orders')
            .send({
                products: [product1.body._id, product2.body._id],
                users: [user1.body._id, user2.body._id]
            });

            const swapOrderId = swapOrder.body._id;

            const response = await supertest(app)
                .put(`/swap-orders/${swapOrderId}`)
                .send({
                    products: [product2.body._id],
                    users: [user1.body._id]
                });

            expect(response.status).toBe(400);
        });

        it('should return an error if the swap order ID does not exist', async () => {
            const swapOrderId = 'non-existent-id';

            const response = await supertest(app)
                .put(`/swap-orders/${swapOrderId}`)
                .send({
                    products: ['new-product','new-product2'],
                    users: ['new-user', 'new-user2']
                });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /swap-orders/:id', () => {
        it('should delete an existing swap order by ID', async () => {
            const swapOrder = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: [product1.body._id, product2.body._id],
                    users: [user1.body._id, user2.body._id]
                });

            const swapOrderId = swapOrder.body._id;

            const response = await supertest(app)
                .delete(`/swap-orders/${swapOrderId}`);

            expect(response.status).toBe(200);
        });

        it('should return an error if the swap order ID does not exist', async () => {
            const swapOrderId = 'non-existent-id';

            const response = await supertest(app)
                .delete(`/swap-orders/${swapOrderId}`);

            expect(response.status).toBe(404);
        });

        it('should delete all swap orders involving a specific user upon user deletion', async () => {
            const swapOrderResponse = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: [product1.body._id, product2.body._id],
                    users: [user1.body._id, user2.body._id]
                });
        
            const swapOrderId = swapOrderResponse.body._id;
    
            const userToDelete = await supertest(app)
                .delete(`/users/${user1.body._id}`);
    
            expect(userToDelete.status).toBe(200);
    
            const deletedSwapOrder = await supertest(app)
                .get(`/swap-orders/${swapOrderId}`);

            const deletedUserSwapOrders = await supertest(app)
                .get(`/swap-orders/user/${user1.body._id}`);

            expect(deletedSwapOrder.body).toBeNull();
            expect(deletedUserSwapOrders.body).toEqual([]);
        });

        it('should delete all swap orders involving a specific product upon product deletion', async () => {
            const swapOrderResponse = await supertest(app)
                .post('/swap-orders')
                .send({
                    products: [product1.body._id, product2.body._id],
                    users: [user1.body._id, user2.body._id]
                });
        
            const swapOrderId = swapOrderResponse.body._id;
    
            const productToDelete = await supertest(app)
                .delete(`/products/${product1.body._id}`);
    
            expect(productToDelete.status).toBe(200);
    
            const deletedSwapOrder = await supertest(app)
                .get(`/swap-orders/${swapOrderId}`);

            const deletedProductswapOrders = await supertest(app)
                .get(`/swap-orders/user/${product1.body._id}`);

            expect(deletedSwapOrder.body).toBeNull();
            expect(deletedProductswapOrders.body).toEqual([]);
        });

        it('should delete all swap orders', async () => {
            await supertest(app)
                .delete('/swap-orders');
    
            const response = await supertest(app)
                .get('/swap-orders');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0); 
        });
    });
});
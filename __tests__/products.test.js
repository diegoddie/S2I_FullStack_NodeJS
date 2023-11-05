import supertest from "supertest";
import { connect } from "../utils/mongoMemoryServer";
const app = require('../connection/index'); 
const mongoose = require('mongoose');

describe('products', () => {
    beforeAll(async() => {
        await connect()
    });
    
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('POST /products', () => {
        it('should create a new product', async () => {
            const response = await supertest(app)
                .post('/products')
                .send({
                    name: 'New Product',
                    image: ['http://example.com/new-product.jpg']
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('image');
        });

        it('should return 400 Bad Request for an invalid product', async () => {
            const response = await supertest(app)
                .post('/products')
                .send({
                    name: 'Invalid Product',
                });
    
            expect(response.status).toBe(400);
        });

        it('should return 400 Bad Request for an empty image array', async () => {
            const response = await supertest(app)
                .post('/products')
                .send({
                    name: 'Invalid Product',
                    image: []
                });
    
            expect(response.status).toBe(400);
        });

        it('should return 400 Bad Request for an image array that contains not valid image URLs', async () => {
            const response = await supertest(app)
                .post('/products')
                .send({
                    name: 'Invalid Product',
                    image: ['bad', 'idea']
                });
    
            expect(response.status).toBe(400);
        });
    });

    describe('GET /products', () => {
        it('should return a list of products', async () => {    
            const response = await supertest(app)
                .get('/products');
    
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);

            response.body.forEach(product => {
                expect(product).toHaveProperty('_id');
                expect(product).toHaveProperty('name');
                expect(product).toHaveProperty('image');
            });
        });

        it('should return a specific product by ID', async () => {
            const createProductResponse = await supertest(app)
                .post("/products")
                .send({
                    name: "Product 3",
                    image: ['http://example.com/image3.jpg']
                });
    
            const productId = createProductResponse.body._id;
            const response = await supertest(app)
                .get(`/products/${productId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("_id");
            expect(response.body._id).toEqual(productId);
        });

        it('should return an error when an ID does not exists', async () => {
            const response = await supertest(app)
                .get('/products/1');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /products/:id', () => {
        it('should update an existing product', async () => {
            const createProductResponse = await supertest(app)
                .post("/products")
                .send({
                    name: "Product to Update",
                    image: ['http://example.com/product-to-update.jpg']
                });
    
            const productId = createProductResponse.body._id;
    
            const response = await supertest(app)
                .put(`/products/${productId}`)
                .send({
                    name: "Updated Product",
                    image: ['http://example.com/updated-product.jpg', 'http://example2.com/updated-product.jpg']
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("_id");
            expect(response.body.name).toEqual("Updated Product");
            expect(response.body.image).toEqual(['http://example.com/updated-product.jpg', 'http://example2.com/updated-product.jpg']);
        });

        it('should return error 404 if the product to update does not exist', async () => {
            const response = await supertest(app)
                .put('/products/2')
                .send({
                    name: "Updated Product",
                    image: ['http://example.com/updated-product.jpg']
                });
    
            expect(response.status).toBe(404);
        });

        it('should return 400 Bad Request for an invalid update', async () => {
            const createProductResponse = await supertest(app)
                .post("/products")
                .send({
                    name: "Product to Update",
                    image: ['http://example.com/product-to-update.jpg']
                });
    
            const productId = createProductResponse.body._id;
    
            const updateProductResponse = await supertest(app)
                .put(`/products/${productId}`)
                .send({
                    image: []
                });
    
            expect(updateProductResponse.status).toBe(400);
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete an existing product by ID', async () => {
            const createProductResponse = await supertest(app)
                .post("/products")
                .send({
                    name: "Product to Delete",
                    image: ['http://example.com/product-to-delete.jpg']
                });
    
            const productId = createProductResponse.body._id;
    
            const deleteProductResponse = await supertest(app)
                .delete(`/products/${productId}`);
    
            expect(deleteProductResponse.status).toBe(200);
            expect(deleteProductResponse.body[0]).toHaveProperty('_id');
            expect(deleteProductResponse.body[0]._id).toBe(productId);
        });

        it('should return 404 Not Found if the product ID does not exist', async () => {    
            const response = await supertest(app)
                .delete('/products/3');
    
            expect(response.status).toBe(404);
        });

        it('should delete all products', async () => {
            await supertest(app)
                .delete('/products');
    
            const response = await supertest(app)
                .get('/products');

            expect(response.status).toBe(200);    
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0); 
        });
    });
})

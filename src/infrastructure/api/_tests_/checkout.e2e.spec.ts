import { ClientModel } from "../../../modules/client-adm/repository/client.model";
import ProductModel from "../../../modules/store-catalog/repository/product.model";
import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E test for checkout", () => {
  beforeEach(async () => {
    sequelize.addModels([ProductModel, ClientModel]);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should checkout a product", async () => {
    await ClientModel.create({
      id: '1',
      name: 'Lucian',
      email: 'lucian@123.com',
      document: "1234-5678",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipcode: "88888-888",      
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const product1 = await request(app).post("/products").send({
      name: "Product 1",
      description: "Product 1 description",
      purchasePrice: 100,
      stock: 10,
    });
    
    const product2 = await request(app).post("/products").send({
      name: "Product 2",
      description: "Product 2 description",
      purchasePrice: 200,
      stock: 10,
    });

    await ProductModel.create({
      id: product1.body.id,
      name: "Product 1",
      description: "Description 1",
      salesPrice: 100,
    });

    await ProductModel.create({
      id: product2.body.id,
      name: "Product 2",
      description: "Description 2",
      salesPrice: 200,
    });

    const response = await request(app).post("/checkout").send({
      clientId: "1",
      products: [
        { productId: product1.body.id },
        { productId: product2.body.id }
      ]
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.invoiceId).toBeDefined();
    expect(response.body.statusId).toBe("approved");
    expect(response.body.total).toBe(300);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.products[0].productId).toBe(product1.body.id);
    expect(response.body.products[1].productId).toBe(product2.body.id);
});

});

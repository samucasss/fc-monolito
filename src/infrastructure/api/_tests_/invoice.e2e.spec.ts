import { InvoiceItemsModel } from "../../../modules/invoice/repository/invoice-items.model";
import { InvoiceModel } from "../../../modules/invoice/repository/invoice.model";
import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E test for invoice", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should find a invoice", async () => {
    const invoice = await InvoiceModel.create(
      {
        id: "1",
        name: "Invoice 123",
        document: "1234-5678",
        street: "Rua A",
        number: "123",
        complement: "Água Verde",
        city: "Curitiba",
        state: "PR",
        zipcode: "88888-888",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "1",
            name: "Item 1",
            price: 100,
          },
          {
            id: "2",
            name: "Item 2",
            price: 200,
          },
        ],
      },
      {
        include: [{ model: InvoiceItemsModel }],
      }
    );

    const response = await request(app).get("/invoice/1").send();

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(invoice.id);
    expect(response.body.name).toEqual(invoice.name);
    expect(response.body.document).toEqual(invoice.document);
    expect(response.body.address.street).toEqual(invoice.street);
    expect(response.body.address.number).toEqual(invoice.number);
    expect(response.body.address.complement).toEqual(invoice.complement);
    expect(response.body.address.city).toEqual(invoice.city);
    expect(response.body.address.state).toEqual(invoice.state);
    expect(response.body.address.zipCode).toEqual(invoice.zipcode);

    expect(response.body.items.length).toEqual(invoice.items.length);

    expect(response.body.items[0].id).toEqual(invoice.items[0].id);
    expect(response.body.items[0].name).toEqual(invoice.items[0].name);
    expect(response.body.items[0].price).toEqual(invoice.items[0].price);

    expect(response.body.items[1].id).toEqual(invoice.items[1].id);
    expect(response.body.items[1].name).toEqual(invoice.items[1].name);
    expect(response.body.items[1].price).toEqual(invoice.items[1].price);

    expect(response.body.total).toEqual(300);
  });
});

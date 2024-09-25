import { Sequelize } from "sequelize-typescript"
import { InvoiceModel } from "../repository/invoice.model"
import InvoiceFacadeFactory from "../factory/invoice.facade.factory"
import { InvoiceItemsModel } from "../repository/invoice-items.model"

describe("Invoice Facade test", () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true }
    })

    sequelize.addModels([InvoiceModel, InvoiceItemsModel])
    await sequelize.sync()
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it("should generate a invoice", async () => {
    const facade = InvoiceFacadeFactory.create()

    const input = {
      name: "Invoice 123",
      document: "1234-5678",
      street: "Rua A",
      number: "123",
      complement: "Água Verde",
      city: "Curitiba",
      state: "PR",
      zipCode: "88888-888",
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
  }

    const output = await facade.generate(input)

    const invoice = await InvoiceModel.findOne({ where: { id: output.id }, include: ["items"] })

    expect(invoice).toBeDefined()
    expect(invoice?.id).toBeDefined()
    expect(invoice?.name).toBe(output.name)
    expect(invoice?.document).toBe(output.document)
    expect(invoice?.street).toBe(output.street)
    expect(invoice?.number).toBe(output.number)
    expect(invoice?.complement).toBe(output.complement)
    expect(invoice?.city).toBe(output.city)
    expect(invoice?.state).toBe(output.state)
    expect(invoice?.zipcode).toBe(output.zipCode)
    expect(invoice?.items.length).toBe(2)
    expect(invoice?.items[0].id).toBeDefined()
    expect(invoice?.items[0].name).toBe(output.items[0].name)
    expect(invoice?.items[0].price).toBe(output.items[0].price)
    expect(invoice?.items[1].id).toBeDefined()
    expect(invoice?.items[1].name).toBe(output.items[1].name)
    expect(invoice?.items[1].price).toBe(input.items[1].price)
    expect(output.total).toBe(300)
  })

  it("should find a client", async () => {

    const facade = InvoiceFacadeFactory.create()

    const invoice = {
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
  }

    await InvoiceModel.create(invoice, { include: [{ model: InvoiceItemsModel }],
  });

    const result = await facade.find({ id: "1" })

    expect(result).toBeDefined()
    expect(result.name).toEqual(invoice.name);
    expect(result.document).toEqual(invoice.document);
    expect(result.address.city).toEqual(invoice.city);
    expect(result.address.complement).toEqual(invoice.complement);
    expect(result.address.number).toEqual(invoice.number);
    expect(result.address.state).toEqual(invoice.state);
    expect(result.address.street).toEqual(invoice.street);
    expect(result.address.zipCode).toEqual(invoice.zipcode);
    expect(result.items.length).toEqual(invoice.items.length);
    expect(result.items[0].id).toEqual(invoice.items[0].id);
    expect(result.items[0].name).toEqual(invoice.items[0].name);
    expect(result.items[0].price).toEqual(invoice.items[0].price);
    expect(result.items[1].id).toEqual(invoice.items[1].id);
    expect(result.items[1].name).toEqual(invoice.items[1].name);
    expect(result.items[1].price).toEqual(invoice.items[1].price);
    expect(result.total).toEqual(300);
    expect(result.createdAt).toEqual(invoice.createdAt);  


  })
})
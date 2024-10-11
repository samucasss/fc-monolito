import { Sequelize } from "sequelize-typescript"
import { ClientOrderModel } from "./client.model"
import { OrderModel } from "./order.model"
import { ProductOrderModel } from "./product.model"
import Id from "../../@shared/domain/value-object/id.value-object"
import CheckoutRepository from "./checkout.repository"
import Order from "../domain/order.entity"
import Client from "../domain/client.entity"
import Product from "../domain/product.entity"

describe("Checkout Repository test", () => {

    let sequelize: Sequelize
  
    beforeEach(async () => {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        sync: { force: true }
      })
  
      sequelize.addModels([OrderModel, ClientOrderModel, ProductOrderModel])
      await sequelize.sync()
    })
  
    afterEach(async () => {
      await sequelize.close()
    })
  
    it("should create a order", async () => {
  
        const checkoutRepository = new CheckoutRepository()

        const input = new Order({
            id: new Id("1"),
            client: new Client({
                id: new Id("1"),
                name: "Client 1",
                email: "mail@x.com",
                street: 'Street 1',
                number: '1',
                complement: 'Complement 1',
                city: 'Lages',
                state: 'SC',
                zipCode: '88888-88',
            }),
            products: [ new Product({
                id: new Id("1"),
                name: "Product 1",
                description: "Description 1",
                salesPrice: 10
            })],
            status: "approved"
        })

        await checkoutRepository.addOrder(input)

        const orderDb = await OrderModel.findOne({
            where: { id: "1" },
            include: [ProductOrderModel, ClientOrderModel]
        })

        expect(orderDb).toBeDefined()
        expect(orderDb.id).toEqual(input.id.id)
        expect(orderDb.client.id).toEqual(input.client.id.id)
        expect(orderDb.client.name).toEqual(input.client.name)
        expect(orderDb.client.email).toEqual(input.client.email)
        expect(orderDb.client.street).toEqual(input.client.street)
        expect(orderDb.client.number).toEqual(input.client.number)
        expect(orderDb.client.complement).toEqual(input.client.complement)
        expect(orderDb.client.city).toEqual(input.client.city)
        expect(orderDb.client.state).toEqual(input.client.state)
        expect(orderDb.client.zipCode).toEqual(input.client.zipCode)
        expect(orderDb.products[0].id).toEqual(input.products[0].id.id)
        expect(orderDb.products[0].name).toEqual(input.products[0].name)
        expect(orderDb.products[0].description).toEqual(input.products[0].description)
        expect(orderDb.products[0].salesPrice).toEqual(input.products[0].salesPrice)
        expect(orderDb.status).toEqual(input.status)
        expect(orderDb.createdAt).toStrictEqual(input.createdAt)
        expect(orderDb.updatedAt).toStrictEqual(input.updatedAt)
    })
  
    it("should find a order", async () => {
        const orderDb = await OrderModel.create({
            id: "1",
            client_id: "1",
            client: {
                id: "1",
                name: "Client 1",
                email: "mail@x.com",
                street: 'Street 1',
                number: '1',
                complement: 'Complement 1',
                city: 'Lages',
                state: 'SC',
                zipCode: '88888-88',
                order_id: "1"
            },
            products: [{
                id: "1",
                order_id: "1",
                name: "Product 1",
                description: "Description 1",
                salesPrice: 10
            }],
            status: "approved",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            include: [{ model: ProductOrderModel }, { model: ClientOrderModel }]
        })
        
        const checkoutRepository = new CheckoutRepository()
        const result = await checkoutRepository.findOrder(orderDb.id)
        
        expect(result).toBeDefined()
        expect(result.id.id).toEqual(orderDb.id)
        expect(result.client.id.id).toEqual(orderDb.client.id)
        expect(result.client.name).toEqual(orderDb.client.name)
        expect(result.client.email).toEqual(orderDb.client.email)
        expect(orderDb.client.street).toEqual(orderDb.client.street)
        expect(orderDb.client.number).toEqual(orderDb.client.number)
        expect(orderDb.client.complement).toEqual(orderDb.client.complement)
        expect(orderDb.client.city).toEqual(orderDb.client.city)
        expect(orderDb.client.state).toEqual(orderDb.client.state)
        expect(orderDb.client.zipCode).toEqual(orderDb.client.zipCode)
        expect(result.products[0].id.id).toEqual(orderDb.products[0].id)
        expect(result.products[0].name).toEqual(orderDb.products[0].name)
        expect(result.products[0].description).toEqual(orderDb.products[0].description)
        expect(result.products[0].salesPrice).toEqual(orderDb.products[0].salesPrice)
        expect(result.status).toEqual(orderDb.status)
    })
})
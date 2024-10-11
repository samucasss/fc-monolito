import { Sequelize } from "sequelize-typescript"
import { OrderModel } from "../repository/order.model"
import { ClientOrderModel } from "../repository/client.model"
import { ProductOrderModel } from "../repository/product.model"
import CheckoutRepository from "../repository/checkout.repository"
import PlaceOrderUseCase from "../usecase/place-order/place-order.usecase"
import CheckoutFacade from "./checkout.facade"
import { PlaceOrderFacadeInputDto } from "./checkout.facade.interface"
import { Umzug } from "umzug"
import { migrator } from "../../../infrastructure/database/migrations/migrator"
import { ProductModel as ProductModelAdm } from "../../../modules/product-adm/repository/product.model";
import PaymentFacadeInterface from "../../payment/facade/payment.facade.interface"

describe('Checkout facade test', () => {
    let sequelize: Sequelize
  
    let migration: Umzug<any>

    beforeEach(async () => {
      sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: ":memory:",
          logging: false
      })
        
      sequelize.addModels([ProductModelAdm, ClientOrderModel, OrderModel, ProductOrderModel])
      migration = migrator(sequelize)
      await migration.up()
      await sequelize.sync();
  })

  afterEach(async () => {
      if (!migration || !sequelize) {
        return 
      }
      migration = migrator(sequelize)
      await migration.down()
      await sequelize.close()
  })

    it('should generate a order', async () => {
      const client = {
        id: '1c',
        name: 'Client 1',
        email: 'client@x.com',
        document: 'Document 1',
        address: {
          street: 'Street 1',
          number: '1',
          complement: 'Complement 1',
          city: 'Lages',
          state: 'SC',
          zipCode: '88888-88',
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const product = {
        productId: '1p',
        stock: 10
      }

      const storeProduct = {
        id: '1p',
        name: 'Product 1',
        description: 'Description 1',
        salesPrice: 110
      }

      const invoice = {
        id: '1v',
        name: 'Client 1',
        document: 'Document 1',
        street: 'Street 1',
        number: '1',
        complement: 'Complement 1',
        city: 'Lages',
        state: 'SC',
        zipCode: '88888-88',
        items: [{
          id: '1p',
          name: 'Product 1',
          price: 110
        }],
        total: 110
      }

      const payment = {
        transactionId: 't1',
        orderId: 'o1',
        amount: 110,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()    
      }

      const clientFacadeMock = {
        find: jest.fn().mockReturnValue(client),
        add: jest.fn()
      }
      const productFacadeMock = {
        checkStock: jest.fn().mockReturnValue(product),
        addProduct: jest.fn()
      }
      const storeCatalogFacadeMock = {
        find: jest.fn().mockReturnValue(storeProduct),
        findAll: jest.fn()
      }
      const checkoutRepository = new CheckoutRepository()
      const invoiceFacadeMock = {
        generate: jest.fn().mockReturnValue(invoice),
        find: jest.fn()
      }
      const paymentFacadeMock: PaymentFacadeInterface = {
        process: jest.fn().mockReturnValue(payment)
      }
      const placeOrderUseCase = new PlaceOrderUseCase(
          clientFacadeMock,
          productFacadeMock,
          storeCatalogFacadeMock,
          invoiceFacadeMock,
          paymentFacadeMock,
          checkoutRepository
      )

      const facade = new CheckoutFacade(placeOrderUseCase)

      const input: PlaceOrderFacadeInputDto = {
          clientId: '1c',
          products: [{
              productId: '1p'
          }]
      }

      const output = await facade.placeOrder(input)
      
      expect(output.id).toBeDefined()
      expect(output.invoiceId).toEqual('1v')
      expect(output.statusId).toEqual(payment.status)
      expect(output.total).toEqual(payment.amount)
      expect(output.products.length).toEqual(1)
    })
})
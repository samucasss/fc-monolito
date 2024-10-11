import Id from "../../../@shared/domain/value-object/id.value-object"
import Product from "../../domain/product.entity"
import PlaceOrderUseCase from "./place-order.usecase"
import { PlaceOrderInputDto } from "./place-order.usecase.dto"

describe('PlaceOrderUseCase unit test', () => {

    describe('validateProducts method', () => {

        //@ts-expect-error - no params in constructor
        const usecase = new PlaceOrderUseCase()

        it('should return a product', async () => {
            const mockCatalogFacade = { 
                find: jest.fn().mockResolvedValue({
                    id: '0',
                    name: 'Product 0',
                    description: 'Product 0 description',
                    salesPrice: 0
                }) 
            }
            //@ts-expect-error - force set clientFacade
            usecase['_catalogFacade'] = mockCatalogFacade

            const productUseCase = await usecase['getProduct']('0')

            expect(productUseCase).toBeInstanceOf(Product)
            expect(productUseCase.id.id).toBe('0')
            expect(productUseCase.name).toBe('Product 0')
            expect(productUseCase.description).toBe('Product 0 description')
            expect(productUseCase.salesPrice).toBe(0)

            expect(mockCatalogFacade.find).toHaveBeenCalled()
        })

        it('should throw an erro when product not found', async () => {
            const mockCatalogFacade = { find: jest.fn().mockResolvedValue(null) }
            //@ts-expect-error - force set clientFacade
            usecase['_catalogFacade'] = mockCatalogFacade
            await expect(usecase['getProduct']('0')).rejects.toThrow('Product not found')
        })

        it('should throw error if no products are selected', async () => {
            const input: PlaceOrderInputDto = { clientId: '0', products: [] }
            await expect(usecase['validateProducts'](input)).rejects.toThrow('No products selected')
        })

        it('should throw an error when product is out of stock', async () => {
            const mockProductFacade = { 
                checkStock: jest.fn(({ productId }: { productId: string }) => Promise.resolve({ productId, stock: productId == '1' ? 0 : 1 })) 
            }
            //@ts-expect-error - force set clientFacade
            usecase['_productFacade'] = mockProductFacade
            let input: PlaceOrderInputDto = { clientId: '0', products: [{ productId: '1' }] }
            await expect(usecase['validateProducts'](input)).rejects.toThrow('Product 1 is not available in stock')
            input = { clientId: '0', products: [{ productId: '0' }, { productId: '1' }] }
            await expect(usecase['validateProducts'](input)).rejects.toThrow('Product 1 is not available in stock')
            expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(3)
            input = { clientId: '0', products: [{ productId: '1' }, { productId: '2' }] }
            await expect(usecase['validateProducts'](input)).rejects.toThrow('Product 1 is not available in stock')
            expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(4)
        })
    })

    describe('execute method', () => {

        it('should throw an error when client not found', async () => {
            const mockFacade = { find: jest.fn().mockResolvedValue(null) }
            //@ts-expect-error - no params in constructor
            const usecase = new PlaceOrderUseCase()
            //@ts-expect-error - force set clientFacade
            usecase['_clientFacade'] = mockFacade
            const input: PlaceOrderInputDto = { clientId: '0', products: [] }
            await expect(usecase.execute(input)).rejects.toThrow('Client not found')
        })

        it('should throw a error when products are not valid', async () => {
            const mockFacade = { find: jest.fn().mockResolvedValue(true) }
            //@ts-expect-error - no params in constructor
            const usecase = new PlaceOrderUseCase()
            const mockValidateProducts = jest
                //@ts-expect-error - spy on private method
                .spyOn(usecase, 'validateProducts')
                //@ts-expect-error - not return never
                .mockRejectedValue(new Error('No products selected'))
            //@ts-expect-error - force set clientFacade
            usecase['_clientFacade'] = mockFacade
            const input: PlaceOrderInputDto = { clientId: '0', products: [] }
            await expect(usecase.execute(input)).rejects.toThrow('No products selected')
            expect(mockValidateProducts).toHaveBeenCalled()
        })
    })

    describe('place an order', () => {

        const clientProps = {
            id: '1c',
            name: 'Client 0',
            document: '00000',
            address: {
                street: 'Some address',
                number: '1',
                complement: '',
                city: 'Some city',
                state: 'Some state',
                zipCode: '000',
            }
        }
        const mockClientFacade = { find: jest.fn().mockResolvedValue(clientProps) }
        const mockPaymentFacade = { process: jest.fn() }
        const mockInvoiceFacade = { generate: jest.fn().mockResolvedValue({ id: '1i' }) }
        const mockCheckoutRepository = { addOrder: jest.fn() }
        const placeOrderUsecase = new PlaceOrderUseCase(
            mockClientFacade as any,
            null,
            null,
            mockInvoiceFacade as any,
            mockPaymentFacade,
            mockCheckoutRepository as any
        )
        const products = {
            '1': new Product({
                id: new Id('1'),
                name: 'Product 1',
                description: 'Product 1 description',
                salesPrice: 100,
            }),
            '2': new Product({
                id: new Id('2'),
                name: 'Product 2',
                description: 'Product 2 description',
                salesPrice: 200,
            })
        }
        const mockValidateProducts = jest
            //@ts-expect-error - spy on private method
            .spyOn(placeOrderUsecase, 'validateProducts')
            //@ts-expect-error - not return never
            .mockResolvedValue(null)

        const mockGetProduct = jest
            //@ts-expect-error - spy on private method
            .spyOn(placeOrderUsecase, 'getProduct')
            //@ts-expect-error - not return never
            .mockImplementation((productId: keyof typeof products) => products[productId])

        it('should not be approved', async () => {
            mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
                transactionId: '1t',
                orderId: '1o',
                amount: 100,
                status: 'error',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            const input: PlaceOrderInputDto = {
                clientId: '1c',
                products: [{ productId: '1' }, { productId: '2' }]
            }
            let output = await placeOrderUsecase.execute(input)
            expect(output.invoiceId).toBeNull()
            expect(output.total).toBe(300)
            expect(output.products).toStrictEqual([{ productId: '1' }, { productId: '2' }])
            expect(mockClientFacade.find).toHaveBeenCalled()
            expect(mockClientFacade.find).toHaveBeenCalledWith({ id: '1c' })
            expect(mockValidateProducts).toHaveBeenCalled()
            expect(mockValidateProducts).toHaveBeenCalledWith(input)
            expect(mockGetProduct).toHaveBeenCalledTimes(2)
            expect(mockCheckoutRepository.addOrder).toHaveBeenCalled()
            expect(mockPaymentFacade.process).toHaveBeenCalled()
            expect(mockPaymentFacade.process).toHaveBeenCalledWith({ orderId: output.id, amount: output.total })
            expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(0)
        })

        it('should be approved', async () => {
            mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
                transactionId: '1t',
                orderId: '1o',
                amount: 100,
                status: 'approved',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            const input: PlaceOrderInputDto = {
                clientId: '1c',
                products: [{ productId: '1' }, { productId: '2' }]
            }
            let output = await placeOrderUsecase.execute(input)
            expect(output.invoiceId).toBe('1i')
            expect(output.total).toBe(300)
            expect(output.products).toStrictEqual([{ productId: '1' }, { productId: '2' }])
            expect(mockClientFacade.find).toHaveBeenCalled()
            expect(mockClientFacade.find).toHaveBeenCalledWith({ id: '1c' })
            expect(mockValidateProducts).toHaveBeenCalled()
            expect(mockGetProduct).toHaveBeenCalledTimes(2)
            expect(mockCheckoutRepository.addOrder).toHaveBeenCalled()
            expect(mockPaymentFacade.process).toHaveBeenCalled()
            expect(mockPaymentFacade.process).toHaveBeenCalledWith({ orderId: output.id, amount: output.total })
            expect(mockInvoiceFacade.generate).toHaveBeenCalled()
            expect(mockInvoiceFacade.generate).toHaveBeenCalledWith({
                name: clientProps.name,
                document: clientProps.document,
                street: clientProps.address.street,
                number: clientProps.address.number,
                complement: clientProps.address.complement,
                city: clientProps.address.city,
                state: clientProps.address.state,
                zipCode: clientProps.address.zipCode,
                items: [
                    {
                        id: products['1'].id.id,
                        name: products['1'].name,
                        price: products['1'].salesPrice,
                    },
                    {
                        id: products['2'].id.id,
                        name: products['2'].name,
                        price: products['2'].salesPrice,
                    },
                ]
            })
        })
    })

})
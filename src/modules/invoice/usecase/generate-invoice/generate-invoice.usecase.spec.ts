import Address from "../../../@shared/domain/value-object/address"
import GenerateInvoiceUseCase from "./generate-invoice.usecase"
import { GenerateInvoiceUseCaseInputDto } from "./generate-invoice.usecase.dto"

const MockRepository = () => {
  return {
    add: jest.fn(),
    find: jest.fn()
  }
}

describe("Generate Invoice use case unit test", () => {

  it("should generate a invoice", async () => {

    const repository = MockRepository()
    const usecase = new GenerateInvoiceUseCase(repository)

    const input: GenerateInvoiceUseCaseInputDto = {
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
      };

    const result =  await usecase.execute(input)

    expect(repository.add).toHaveBeenCalled()
    expect(result.id).toBeDefined()
    expect(result.name).toEqual(input.name)
    expect(result.document).toEqual(input.document);
    expect(result.street).toEqual(input.street);
    expect(result.number).toEqual(input.number);
    expect(result.complement).toEqual(input.complement);
    expect(result.city).toEqual(input.city);
    expect(result.state).toEqual(input.state);
    expect(result.zipCode).toEqual(input.zipCode);
    expect(result.items.length).toEqual(input.items.length);
    expect(result.items[0].id).toEqual(input.items[0].id);
    expect(result.items[0].name).toEqual(input.items[0].name);
    expect(result.items[0].price).toEqual(input.items[0].price);
    expect(result.items[1].id).toEqual(input.items[1].id);
    expect(result.items[1].name).toEqual(input.items[1].name);
    expect(result.items[1].price).toEqual(input.items[1].price);
    expect(result.total).toEqual(300);

  })
})
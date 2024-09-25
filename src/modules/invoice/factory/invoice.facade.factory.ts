import InvoiceFacade from "../facade/invoice.facade";
import InvoiceRepository from "../repository/invoice.repository";
import GenerateInvoiceUseCase from "../usecase/generate-invoice/generate-invoice.usecase";
import FindInvoiceUseCase from "../usecase/find-invoice/find-invoice.usecase";

export default class ClientAdmFacadeFactory {
  static create() {
    const repository = new InvoiceRepository();
    const findUsecase = new FindInvoiceUseCase(repository);
    const generateUsecase = new GenerateInvoiceUseCase(repository);
    const facade = new InvoiceFacade({
      findUsecase: findUsecase,
      generateUsecase: generateUsecase,
    });

    return facade;
  }
}

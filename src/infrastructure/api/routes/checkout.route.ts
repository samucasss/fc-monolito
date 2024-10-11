import express, { Request, Response } from "express";
import PlaceOrderUseCase from "../../../modules/checkout/usecase/place-order/place-order.usecase";
import ClientAdmFacadeInterface from "../../../modules/client-adm/facade/client-adm.facade.interface";
import ClientAdmFacadeFactory from "../../../modules/client-adm/factory/client-adm.facade.factory";
import ProductAdmFacadeInterface from "../../../modules/product-adm/facade/product-adm.facade.interface";
import ProductAdmFacadeFactory from "../../../modules/product-adm/factory/facade.factory";
import StoreCatalogFacadeInterface from "../../../modules/store-catalog/facade/store-catalog.facade.interface";
import StoreCatalogFacadeFactory from "../../../modules/store-catalog/factory/facade.factory";
import InvoiceFacadeInterface from "../../../modules/invoice/facade/invoice.facade.interface";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";
import PaymentFacadeInterface from "../../../modules/payment/facade/payment.facade.interface";
import PaymentFacadeFactory from "../../../modules/payment/factory/payment.facade.factory";
import CheckoutGateway from "../../../modules/checkout/gateway/checkout.gateway";
import CheckoutRepository from "../../../modules/checkout/repository/checkout.repository";
import { PlaceOrderInputDto } from "../../../modules/checkout/usecase/place-order/place-order.usecase.dto";

export const checkoutRoute = express.Router();

checkoutRoute.post("/", async (req: Request, res: Response) => {
  const clientFacade: ClientAdmFacadeInterface = ClientAdmFacadeFactory.create()
  const productFacade: ProductAdmFacadeInterface = ProductAdmFacadeFactory.create()
  const catalogFacade: StoreCatalogFacadeInterface = StoreCatalogFacadeFactory.create()
  const invoiceFacade: InvoiceFacadeInterface = InvoiceFacadeFactory.create()
  const paymentFacade: PaymentFacadeInterface = PaymentFacadeFactory.create()
  const repository: CheckoutGateway = new CheckoutRepository()

  const usecase = new PlaceOrderUseCase(clientFacade, productFacade, catalogFacade, invoiceFacade, paymentFacade, 
    repository);

  try {
    const placeOrderInputDto: PlaceOrderInputDto = {
      clientId: req.body.clientId,
      products: req.body.products
    };

    const output = await usecase.execute(placeOrderInputDto);
    res.send(output);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

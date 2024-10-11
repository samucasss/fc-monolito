import express, { Request, Response } from "express";
import FindInvoiceUseCase from "../../../modules/invoice/usecase/find-invoice/find-invoice.usecase";
import InvoiceRepository from "../../../modules/invoice/repository/invoice.repository";
import { FindInvoiceUseCaseInputDTO } from "../../../modules/invoice/usecase/find-invoice/find-invoice.usecase.dto";

export const invoiceRoute = express.Router();

invoiceRoute.get("/:id", async (req: Request, res: Response) => {
  const usecase = new FindInvoiceUseCase(new InvoiceRepository());
  try {
    const invoiceDto: FindInvoiceUseCaseInputDTO = {
      id: req.params.id,
    };
    const output = await usecase.execute(invoiceDto);
    res.send(output);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

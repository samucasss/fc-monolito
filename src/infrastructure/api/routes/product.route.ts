import express, { Request, Response } from "express";
import AddProductUseCase from "../../../modules/product-adm/usecase/add-product/add-product.usecase";
import { AddProductInputDto } from "../../../modules/product-adm/usecase/add-product/add-product.dto";
import ProductRepository from "../../../modules/product-adm/repository/product.repository";

export const productRoute = express.Router();

productRoute.post("/", async (req: Request, res: Response) => {
    const usecase = new AddProductUseCase(new ProductRepository());
    try {
      const productDto: AddProductInputDto = {
        name: req.body.name,
        description: req.body.description,
        purchasePrice: req.body.purchasePrice,
        stock: req.body.stock,
      };
      const output = await usecase.execute(productDto);
      res.send(output);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  });
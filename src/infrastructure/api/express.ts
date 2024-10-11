import express, { Express } from "express";
import { Sequelize } from "sequelize-typescript";
import { ProductModel } from "../../modules/product-adm/repository/product.model";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import { InvoiceModel } from "../../modules/invoice/repository/invoice.model";
import { productRoute } from "./routes/product.route";
import { clientRoute } from "./routes/client.route";
import { invoiceRoute } from "./routes/invoice.route";
import { checkoutRoute } from "./routes/checkout.route";
import { InvoiceItemsModel } from "../../modules/invoice/repository/invoice-items.model";
import { OrderModel } from "../../modules/checkout/repository/order.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { ProductOrderModel } from "../../modules/checkout/repository/product.model";
import { ClientOrderModel } from "../../modules/checkout/repository/client.model";

export const app: Express = express();
app.use(express.json());
app.use("/products", productRoute);
app.use("/clients", clientRoute);
app.use("/checkout", checkoutRoute);
app.use("/invoice", invoiceRoute);

export let sequelize: Sequelize;

async function setupDb() {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
  sequelize.addModels([ProductModel, ClientModel, InvoiceModel, InvoiceItemsModel, 
    OrderModel, ProductOrderModel, ClientOrderModel, TransactionModel
  ]);

  await sequelize.sync();
}

setupDb();
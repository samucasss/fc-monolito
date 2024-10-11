import { BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { ClientOrderModel } from "./client.model";
import { ProductOrderModel } from "./product.model";

@Table({
    tableName: 'orders',
    timestamps: false
})
export class OrderModel extends Model {
    @PrimaryKey
    @Column({ allowNull: false })
    declare id: string;

    @ForeignKey(() => ClientOrderModel)
    @Column({ allowNull: false })
    declare client_id: string;

    @BelongsTo(() => ClientOrderModel)
    declare client: ClientOrderModel;
  
    @HasMany(() => ProductOrderModel)
    declare products: ProductOrderModel[];

    @Column({ allowNull: false })
    declare status: string;

    @Column({ allowNull: false })
    declare createdAt: Date
  
    @Column({ allowNull: false })
    declare updatedAt: Date
}
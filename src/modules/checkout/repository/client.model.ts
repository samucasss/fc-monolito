import { Column, Model, PrimaryKey, Table } from "sequelize-typescript"

@Table({
    tableName: 'clients',
    timestamps: false
})
export class ClientOrderModel extends Model {
    @PrimaryKey
    @Column({ allowNull: false })
    declare id: string

    @Column({ allowNull: false })
    declare name: string
    
    @Column({ allowNull: false })
    declare email: string

    @Column({ allowNull: false })
    declare street: string
  
    @Column({ allowNull: false })
    declare number: string
  
    @Column({ allowNull: true })
    declare complement: string
  
    @Column({ allowNull: false })
    declare city: string
  
    @Column({ allowNull: false })
    declare state: string
  
    @Column({ allowNull: false })
    declare zipCode: string
}
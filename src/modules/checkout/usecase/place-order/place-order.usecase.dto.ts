export interface PlaceOrderInputDto {
    clientId: string
    products: {
        productId: string
    }[]
}

export interface PlaceOrderOutputDto {
    id: string
    invoiceId: string
    statusId: string
    total: number
    products: {
        productId: string
    }[]
}
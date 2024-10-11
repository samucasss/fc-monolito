import UseCaseInterface from "../../@shared/usecase/use-case.interface"
import CheckoutFacadeInterface, { PlaceOrderFacadeInputDto, PlaceOrderFacadeOutputDto } from "./checkout.facade.interface";

export default class CheckoutFacade implements CheckoutFacadeInterface {
    private _placeOrder: UseCaseInterface

    constructor(placeOrder: UseCaseInterface) {
        this._placeOrder = placeOrder
    }

    async placeOrder(input: PlaceOrderFacadeInputDto): Promise<PlaceOrderFacadeOutputDto> {
        return await this._placeOrder.execute(input)
    }

}
import type { BaseResponseData } from "../../../types/base";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { ITrashUserResponse } from "./trash.response";

export class TrashAPI {
    // Define your API methods here

    constructor(private apiClient: IApiCaller) {
        // Initialization code if needed
    }

    async getCustomersInTrash() {
        const { data } = await this.apiClient.get<ITrashUserResponse>("/trash/customers");
        return data;
    }

    async restoreCustomersInTrash(id: number) {
        const { data } = await this.apiClient.post<BaseResponseData<{ success: boolean }>>(`/trash/customers/${id}/restore`);
        return data;
    }

    async deleteCustomersPermanently(id: number) {
        const { data } = await this.apiClient.delete<BaseResponseData<{ success: boolean }>>(`/trash/customers/${id}`);
        return data;
    }

}

import { useState } from "react";
import { requestGetServices, requestUpdateServiceStatus, requestCreateService } from "../services/services.service";

import type { ServiceResponse } from "../types/api/responses/service.response";
import type { ApiError } from "../types/api/responses/api-error";
import type { CreateServiceDto } from "../types/api/request/create-service.dto";


export function useServices() {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function createService(createService: CreateServiceDto): Promise<ServiceResponse> {
        
        setError(null);
        setLoading(true);

        return await requestCreateService(createService)
            .catch((error: ApiError) => {setError(error.message); console.log(error); throw error.message;})
            .finally(() => setLoading(false));
    }

    async function getServices(): Promise<ServiceResponse[]> {

        setError(null);
        setLoadingTable(true);

        return await requestGetServices()
            .catch((error: ApiError) => {setError(error.message); throw error.message})
            .finally(() => setLoadingTable(false));
    }

    async function updateServiceStatus(id: number, status: boolean): Promise<boolean> {
        
        setError(null);

        return await requestUpdateServiceStatus(id, status)
            .catch((error: ApiError) => {setError(error.message); throw error.message})
    }

    return { getServices, updateServiceStatus, createService, loading, loadingTable, error }
}
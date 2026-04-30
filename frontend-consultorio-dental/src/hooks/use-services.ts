import { useState } from "react";
import { requestGetServices, requestUpdateServiceStatus, requestCreateService } from "../services/services.service";

import type { Service } from "@/types/models/service";
import type { CreateServiceDto } from "../types/api/request/create-service.dto";

export function useServices() {

    const [servicesData, setServicesData] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function createService(createServiceDto: CreateServiceDto): Promise<Service | null> {
        setError(null);
        setIsLoading(true);

        try {
            const serviceCreated = await requestCreateService(createServiceDto);
            setServicesData(prev => [...prev, serviceCreated]);
            return serviceCreated;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            return null;

        } finally {
            setIsLoading(false);
        }
    }

    async function getServices() {

        setError(null);
        setIsLoading(true);

        try {
            const users = await requestGetServices();
            setServicesData(users);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);

        } finally { setIsLoading(false) }

    }

    async function updateServiceStatus(id: number, status: boolean): Promise<boolean> {
        setError(null);
        setIsLoading(true);

        try {
            const isStatusUpdated = await requestUpdateServiceStatus(id, status);
            isStatusUpdated && setServicesData(prev => prev.map(service => service.id === id ? {...service, status} : service));
            return isStatusUpdated;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            return false;

        } finally {
            setIsLoading(false);
        }
    }

    return { 
        servicesData, 
        getServices, 
        updateServiceStatus, 
        createService, 
        isLoading, 
        error 
    }
}
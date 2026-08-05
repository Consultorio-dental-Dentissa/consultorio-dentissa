import type { ServiceResponse } from "@/features/services/types/service.response";
import type { Service } from "@/features/services/types/service.model";

export function serviceMap(service: ServiceResponse): Service {
    return {
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
        description: service.description,
        status: service.status
    }
}
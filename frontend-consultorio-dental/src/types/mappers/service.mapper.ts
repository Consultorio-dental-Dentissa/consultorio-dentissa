import type { ServiceResponse } from "../api/responses/service.response";
import type { Service } from "../models/service";

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
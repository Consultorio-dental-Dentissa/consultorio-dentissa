import type { ServiceResponse } from "@/features/services/types/service.response";
import type { Service } from "@/features/services/types/service.model";
import { resolveApiUrl } from "@/services/api";

export function serviceMap(service: ServiceResponse): Service {
    return {
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
        description: service.description,
        status: service.status,
        images: (service.images ?? []).map((image) => ({
            id: image.id,
            url: resolveApiUrl(image.url),
        })),
    };
}

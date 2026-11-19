import type { ReactNode, SVGProps } from "react";

/**
 * Iconos de la navegación extraídos literalmente de docs/DISEÑO-FINAL (trazo 1.9, 24x24, extremos redondeados).
 * Usan `currentColor` para que el activo (rosa #fc7186) y el inactivo (blanco) se controlen con la clase de texto.
 */
export type NavIcon = (props: SVGProps<SVGSVGElement>) => ReactNode;

function make(paths: ReactNode): NavIcon {
    return function Icon({ className, ...props }) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                height="20"
                className={className}
                aria-hidden="true"
                {...props}
            >
                {paths}
            </svg>
        );
    };
}

export const HomeIcon = make(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />);
export const CalendarIcon = make(<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>);
export const PatientIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const UsersIcon = make(<><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></>);
export const ToothIcon = make(<path d="M12 5.5C10 2.5 4 3 4 8c0 4 2 6 3 9 .6 1.8 1.2 4 2 4s1-2 1.5-4 .8-3 1.5-3 1 1 1.5 3 .7 4 1.5 4 1.4-2.2 2-4c1-3 3-5 3-9 0-5-6-5.5-8-2.5Z" />);
export const ConsultationIcon = make(<><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>);
export const OfferIcon = make(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z" /><circle cx="8" cy="8" r="1.5" /></>);
export const FaqIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5M12 17h.01" /></>);
export const BellIcon = make(<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />);
export const LogoutIcon = make(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />);
/** Auditoría: sin maqueta; mismo trazo que el resto (documento con líneas). */
export const AuditIcon = make(<><path d="M5 4h14v16H5z" /><path d="M9 9h6M9 13h6M9 17h3" /></>);

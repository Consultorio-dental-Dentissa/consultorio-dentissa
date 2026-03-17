import { useEffect } from 'react';

type TipoAlerta = 'success' | 'error' | 'warning';

interface Props {
    mensaje: string;
    tipo: TipoAlerta;
    onCerrar: () => void;
}

export function Alerta({ mensaje, tipo, onCerrar }: Props) {

    useEffect(() => {
        const timer = setTimeout(() => {
            onCerrar();
        }, 2000);

        return () => clearTimeout(timer);
    }, [mensaje, tipo]);

    return (
        <div className={`alerta alerta-${tipo}`}>
            <span>{mensaje}</span>
        </div>
    );
}
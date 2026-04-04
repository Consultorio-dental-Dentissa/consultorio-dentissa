interface ToggleButtonProps {
    estado: boolean
    onChange: (nuevoEstado: boolean) => void
}


export function ToggleButton({ estado, onChange }: ToggleButtonProps) {

    return (
        <label className="toggle">
            <input
                type="checkbox"
                checked= { estado }
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
        </label>
    );
}
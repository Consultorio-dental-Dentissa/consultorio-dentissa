interface ToggleButtonProps {
    status: boolean
    onChange: (nuevoEstado: boolean) => void
}


export function ToggleButton({ status, onChange }: ToggleButtonProps) {

    return (
        <label className="toggle">
            <input
                type="checkbox"
                checked= { status }
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
        </label>
    );
}
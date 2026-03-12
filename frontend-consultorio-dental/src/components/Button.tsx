export function Button ({texto, onClick} : any) {

    return (
        <button className="button" type="button" onClick={onClick}>{texto}</button>
    )
}
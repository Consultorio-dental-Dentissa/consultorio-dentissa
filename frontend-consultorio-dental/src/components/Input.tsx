


export function Input (texto : string, type: string, placeholder: string) {

    return (
        <div>
            <label htmlFor="">{texto}</label>
            <input type={type} placeholder={placeholder} />
        </div>
    );

}
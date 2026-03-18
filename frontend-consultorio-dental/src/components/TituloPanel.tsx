
type TituloPanelProps = {
    titulo: string;
    subtitulo: string;
}

export function TituloPanel ({titulo, subtitulo} : TituloPanelProps) {

    return (
        <div>
            <div className="contenedor-titulo-panel">
                <h4>{titulo}</h4>
                <h5>{subtitulo}</h5>
            </div>
        </div>
    );

}

type PageTitleProps = {
    titulo: string;
    subtitulo: string;
}

export function PageTitle ({titulo, subtitulo} : PageTitleProps) {

    return (
        <div>
            <div className="flex-row">
                <h4 className="text-3xl font-bold">{titulo}</h4>
                <h5 className="text-sm font-medium text-zinc-500 mt-1">{subtitulo}</h5>
            </div>
        </div>
    );

}
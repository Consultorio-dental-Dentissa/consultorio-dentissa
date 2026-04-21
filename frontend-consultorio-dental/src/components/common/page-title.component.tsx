
type PageTitleProps = {
    titulo: string;
    subtitulo: string;
}

export function PageTitle ({titulo, subtitulo} : PageTitleProps) {

    return (
        <div>
            <div className="flex-row">
                <h4 className="text-2xl font-bold">{titulo}</h4>
                <h5 className="text-base text-gray-700">{subtitulo}</h5>
            </div>
        </div>
    );

}
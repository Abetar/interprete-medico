type Props = {
    result: string;
};

export default function InterpretationResult({ result }: Props) {
    if (!result) return null;

    return (
        <div
            id="result-area"
            className="mt-6 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm"
        >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🩺 Interpretación médica:
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p>

            <p className="text-xs text-gray-500 mt-4 italic">
                * Esta información es educativa y no reemplaza la opinión de un profesional de la salud.
            </p>
        </div>
    );
}

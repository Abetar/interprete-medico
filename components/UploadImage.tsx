import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InterpretationResult from './InterpretationResult';

export default function UploadImage() {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    // const [ocrText, setOcrText] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageCount, setImageCount] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const limiteAlcanzado = imageCount >= 2;

    const pareceAnalisisClinico = (texto: string): boolean => {
        const patrones = [
            'hemoglobina', 'leucocitos', 'plaquetas', 'colesterol', 'urea',
            'biometría', 'química sanguínea', 'glucosa', 'hematocrito',
            'eritrocitos', 'tsh', 'hdl', 'ldl'
        ];

        const textoLimpio = texto.toLowerCase();
        return patrones.some(palabra => textoLimpio.includes(palabra));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (limiteAlcanzado) {
            alert('Solo puedes interpretar un máximo de 2 imágenes por sesión.');
            return;
        }

        setImages(prev => [...prev, file]);
        setPreviews(prev => [...prev, URL.createObjectURL(file)]);
        setImageCount(prev => prev + 1);
    };

    const handleInterpret = async () => {
        setLoading(true);
        setResult('');
        let fullText = '';

        for (const image of images) {
            const { data } = await Tesseract.recognize(image, 'eng', {
                logger: m => console.log(m),
            });
            fullText += `\n${data.text}`;
        }

        try {
            const res = await fetch('/api/interpreter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: fullText }),
            });

            if (!pareceAnalisisClinico(fullText)) {
                setResult('⚠️ El contenido extraído no parece un análisis clínico válido. Por favor, sube una imagen clara del documento de laboratorio.');
                setLoading(false);
                return;
            }

            const data = await res.json();
            setResult(data.result || 'Error al interpretar.');
        } catch (err) {
            console.error(err);
            setResult('Error de conexión con la API.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('result-area');
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('interpretacion-analisis.pdf');
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);

        setImages(updatedImages);
        setPreviews(updatedPreviews);
        setImageCount(prev => prev - 1);

        // 🧠 Limpiar resultado si ya no hay imágenes (o se eliminó la que generó el resultado)
        if (updatedImages.length === 0) {
            setResult('');
            // setOcrText('');
        }

    };


    return (
        <div className="max-w-xl mx-auto mt-10 px-6 py-8 bg-white rounded-xl shadow-md">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" ref={cameraInputRef} />

            {/* Botones */}
            <div className="container mx-auto mb-4">
                <div className="row">
                    <div className="col-lg-4 offset-lg-4">
                        <button onClick={() => fileInputRef.current?.click()} className="btn-rounded w-100 mt-3" disabled={limiteAlcanzado}>
                            📁 Subir imagen
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-4 offset-lg-4">
                        <button onClick={() => cameraInputRef.current?.click()} className="btn-rounded w-100 mt-3" disabled={limiteAlcanzado}>
                            📷 Tomar foto
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">Imágenes cargadas: {imageCount} / 2</p>
                {limiteAlcanzado && (
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-outline-danger w-100"
                            onClick={() => window.location.reload()}
                        >
                            🔁 Analizar otro estudio
                        </button>
                    </div>
                )}
            </div>

            {/* Miniaturas */}
            <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
                {previews.map((src, i) => (
                    <div key={i} className="position-relative border rounded p-2 bg-light shadow-sm">
                        {/* Botón eliminar */}
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-1"
                            aria-label="Eliminar"
                            onClick={() => handleRemoveImage(i)}
                            style={{ fontSize: '0.8rem' }}
                        ></button>

                        {/* Miniatura */}
                        <img
                            src={src}
                            alt={`Imagen ${i + 1}`}
                            className="img-thumbnail"
                            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                        />
                    </div>
                ))}
            </div>

            {/* Botón interpretar */}
            {images.length > 0 && !result && (

                <div className="container mx-auto mb-4">
                    <div className='row'>
                        <div className="col-lg-4 offset-lg-4">
                            <button
                                className="btn-rounded w-100 mt-3"
                                onClick={handleInterpret}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm text-light" role="status" />
                                        Procesando...
                                    </>
                                ) : (
                                    '🧠 Interpretar análisis'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            )}

            {/* Cargando */}
            {loading && <p className="text-center text-blue-600 font-medium mt-4">Procesando análisis...</p>}

            {/* Resultado */}
            {result && (
                <>
                    <InterpretationResult result={result} />
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-4 offset-lg-4">
                                <button className="btn-rounded mt-4 w-100" onClick={handleDownloadPDF}>
                                    📄 Descargar como PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

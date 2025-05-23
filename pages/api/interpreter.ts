import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Texto faltante para interpretar' });
    }

    const prompt = `
Actúa como un asistente médico virtual.

1. Primero, detecta si el texto extraído parece un análisis clínico. 
   Busca valores como hemoglobina, glucosa, colesterol, leucocitos, urea, etc.

2. Si NO parece un análisis clínico, responde:
"El texto no parece un análisis clínico válido. Intenta subir una imagen más clara del estudio."

3. Si SÍ es un análisis clínico:
- Explica cada valor con frases simples y breves.
- Menciona si está en rango, alto o bajo.
- No uses tecnicismos.
- No hagas diagnósticos ni alarmes.
- Sé empático y educativo.
- De ser posible da sugerencias generales de salud hasta el final del texto.

Usa un lenguaje claro y directo para personas sin conocimientos médicos.

Texto:
"""
${content}
"""
`;

    try {
        const chat = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            temperature: 0.6,
        });

        console.log('Texto recibido:', content);

        const responseText = chat.choices[0]?.message?.content || '';
        return res.status(200).json({ result: responseText });

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error de OpenAI:', error.message);
            return res.status(500).json({ error: 'Error al procesar con OpenAI' });
        } else {
            console.error('Error inesperado:', error);
            return res.status(500).json({ error: 'Error inesperado del servidor' });
        }
    }
}
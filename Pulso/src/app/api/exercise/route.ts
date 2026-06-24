import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { EXERCISE_SYSTEM_PROMPT } from '@/lib/prompts';
import { Language, Exercise } from '@/types';

// POST /api/exercise — genera un ejercicio nuevo para el alumno
export async function POST(request: Request) {
  try {
    const { language, difficulty, concept } = await request.json();

    if (!language || !difficulty) {
      return NextResponse.json(
        { error: 'language y difficulty son requeridos' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: EXERCISE_SYSTEM_PROMPT(language as Language, difficulty, concept),
        },
        {
          role: 'user',
          content: `Generá un ejercicio de ${difficulty} para ${language}${concept ? ` enfocado en ${concept}` : ''}.`,
        },
      ],
      temperature: 0.8, // un poco de variedad para que no repita ejercicios
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content || '';

    // Limpiar por si el modelo manda backticks o texto extra
    const clean = raw.replace(/```json|```/g, '').trim();

    let exercise: Exercise;
    try {
      exercise = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Error al parsear ejercicio de la IA', raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ exercise }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { getSupabase } from '@/lib/supabase';
import { DIAGNOSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import { DiagnosisResult } from '@/types';

// POST /api/answer — evalúa la respuesta del alumno y guarda el diagnóstico
export async function POST(request: Request) {
  try {
    const {
      student_id,
      session_id,
      exercise_prompt,
      starter_code,
      student_answer,
      hint_used,
      language,
    } = await request.json();

    if (!student_id || !session_id || !exercise_prompt || !student_answer) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: student_id, session_id, exercise_prompt, student_answer' },
        { status: 400 }
      );
    }

    // Llamar a la IA para diagnosticar
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: DIAGNOSIS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `
LENGUAJE: ${language || 'no especificado'}

EJERCICIO:
${exercise_prompt}

CÓDIGO BASE:
${starter_code || '(no hay código base)'}

RESPUESTA DEL ALUMNO:
${student_answer}

Diagnosticá esta respuesta y devolvé el JSON.
          `.trim(),
        },
      ],
      temperature: 0.2, // baja temperatura para diagnósticos consistentes
      max_tokens: 400,
    });

    const raw = completion.choices[0].message.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();

    let diagnosis: DiagnosisResult;
    try {
      diagnosis = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Error al parsear diagnóstico de la IA', raw },
        { status: 500 }
      );
    }

    // Guardar la respuesta y el diagnóstico en Supabase
    const { data: answer, error: answerError } = await getSupabase()
      .from('answers')
      .insert([
        {
          student_id,
          session_id,
          exercise_prompt,
          student_answer,
          is_correct: diagnosis.is_correct,
          error_type: diagnosis.error_type,
          error_explanation: diagnosis.error_explanation,
          hint_used: hint_used || false,
          next_difficulty: diagnosis.next_difficulty,
        },
      ])
      .select()
      .single();

    if (answerError) {
      return NextResponse.json({ error: answerError.message }, { status: 500 });
    }

    // Si la respuesta es correcta, actualizar score y ejercicios completados del alumno
    if (diagnosis.is_correct) {
      await getSupabase().rpc('increment_student_score', {
        p_student_id: student_id,
        p_score_delta: 10,
      });
    }

    return NextResponse.json({ diagnosis, answer }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
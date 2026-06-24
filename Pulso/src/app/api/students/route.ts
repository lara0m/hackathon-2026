import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/students — el alumno se une a una sesión con código + nombre + lenguaje
export async function POST(request: Request) {
  try {
    const { session_code, name, language } = await request.json();

    if (!session_code || !name || !language) {
      return NextResponse.json(
        { error: 'session_code, name y language son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la sesión existe
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('code', session_code.toUpperCase())
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesión no encontrada. Verificá el código.' }, { status: 404 });
    }

    // Crear el alumno
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          session_id: session.id,
          name: name.trim(),
          language,
          score: 0,
          exercises_completed: 0,
        },
      ])
      .select()
      .single();

    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    return NextResponse.json({ student }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log("1. Recibiendo request en /api/students...");
    const body = await request.json();
    console.log("2. Body recibido:", body);

    const { sessionCode, name, language } = body;

    console.log(`3. Buscando sesión con código: ${sessionCode}...`);
    const { data: session, error: sessionError } = await getSupabase()
      .from('sessions')
      .select('id')
      .eq('code', sessionCode)
      .single();

    if (sessionError || !session) {
      console.log("4. Error o sesión no encontrada:", sessionError);
      return NextResponse.json({ error: 'Código de sesión inválido' }, { status: 404 });
    }

    console.log(`5. Sesión encontrada (ID: ${session.id}). Creando alumno...`);
    const { data: student, error: studentError } = await getSupabase()
      .from('students')
      .insert([{ session_id: session.id, name, language }])
      .select()
      .single();

    if (studentError) {
      console.log("6. Error al crear alumno en la BD:", studentError);
      throw studentError;
    }

    console.log("7. Alumno creado con éxito!");
    return NextResponse.json(student);
  } catch (error: any) {
    console.error("ERROR CAPTURADO EN EL CATCH:", error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
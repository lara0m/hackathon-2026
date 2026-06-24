import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Genera un código de 6 letras mayúsculas aleatorio
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres confusos como 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/sessions — el docente crea una sesión nueva
export async function POST(request: Request) {
  try {
    const { teacher_name } = await request.json();

    if (!teacher_name) {
      return NextResponse.json({ error: 'teacher_name es requerido' }, { status: 400 });
    }

    // Generar código único
    let code = generateCode();
    let attempts = 0;

    // Nos aseguramos que el código no exista ya
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([{ code, teacher_name, topic: 'programming' }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET /api/sessions?code=ABC123 — verificar que una sesión existe
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'code es requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ session: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
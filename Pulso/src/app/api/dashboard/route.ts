import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ERROR_TYPE_LABELS } from '@/lib/prompts';
import { DashboardData } from '@/types';

// GET /api/dashboard?session_id=xxx — datos agregados para el dashboard del docente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json({ error: 'session_id es requerido' }, { status: 400 });
    }

    // Traer todos los alumnos de la sesión
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 });
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        total_students: 0,
        active_students: 0,
        error_summary: [],
        students: [],
      } as DashboardData);
    }

    // Traer todas las respuestas de la sesión
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false });

    if (answersError) {
      return NextResponse.json({ error: answersError.message }, { status: 500 });
    }

    const allAnswers = answers || [];

    // Calcular alumnos activos (respondieron en los últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const activeStudentIds = new Set(
      allAnswers
        .filter((a) => a.created_at > fiveMinutesAgo)
        .map((a) => a.student_id)
    );

    // Agregar errores — contar cuántos alumnos distintos cometieron cada tipo
    const errorMap: Record<string, Set<string>> = {};
    for (const answer of allAnswers) {
      if (!answer.is_correct && answer.error_type && answer.error_type !== 'none') {
        if (!errorMap[answer.error_type]) {
          errorMap[answer.error_type] = new Set();
        }
        errorMap[answer.error_type].add(answer.student_id);
      }
    }

    const error_summary = Object.entries(errorMap)
      .map(([error_type, studentSet]) => ({
        error_type: error_type as any,
        count: studentSet.size,
        label: ERROR_TYPE_LABELS[error_type] || error_type,
      }))
      .sort((a, b) => b.count - a.count); // ordenar de más frecuente a menos

    // Para cada alumno, calcular su último error y status
    const studentsWithStatus = students.map((student) => {
      const studentAnswers = allAnswers.filter((a) => a.student_id === student.id);
      const lastAnswer = studentAnswers[0]; // ya está ordenado por created_at desc

      // Status: struggling si el último error fue hace menos de 3 min y no acertó
      let status: 'ok' | 'struggling' | 'idle' = 'idle';
      if (lastAnswer) {
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
        if (lastAnswer.created_at > threeMinutesAgo) {
          status = lastAnswer.is_correct ? 'ok' : 'struggling';
        }
      }

      return {
        id: student.id,
        name: student.name,
        language: student.language,
        score: student.score,
        exercises_completed: student.exercises_completed,
        last_error_type: lastAnswer?.error_type || null,
        status,
      };
    });

    const dashboardData: DashboardData = {
      total_students: students.length,
      active_students: activeStudentIds.size,
      error_summary,
      students: studentsWithStatus,
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
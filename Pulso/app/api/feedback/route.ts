import { NextResponse } from 'next/server';
import { diagnose } from '../../../lib/openai';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  const { exercise, answer, reasoning } = await request.json();

  // Call the diagnose function from OpenAI
  const diagnosis = await diagnose(exercise, answer, reasoning);

  // Insert the diagnosis into the Supabase database
  const { data, error } = await supabase
    .from('diagnoses')
    .insert([{ exercise, answer, reasoning, diagnosis }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ diagnosis, record: data[0] }, { status: 200 });
}
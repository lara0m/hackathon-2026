"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ExerciseData {
  title?: string;
  description?: string;
  exercise_prompt?: string;
  starter_code?: string;
  hint?: string;
  prompt?: string;
  codeTemplate?: string;
  code?: string;
  instructions?: string;
  explanation?: string;
}

interface FeedbackState {
  success: boolean;
  msg: string;
  explanation?: string;
  error_type?: string;
}

const MAX_QUESTIONS = 3;
const BLANK = "[BLANK]";

function normalise(raw: ExerciseData): ExerciseData {
  return {
    title:           raw.title        || raw.instructions  || "Desafío de código",
    description:     raw.description  || raw.exercise_prompt || raw.prompt || raw.instructions || "",
    starter_code:    raw.starter_code || raw.codeTemplate  || raw.code    || "",
    hint: raw.hint || raw.explanation || "Revisá la sintaxis de tu código, asegurate de usar las variables correctas y no olvidar signos de puntuación.",
    exercise_prompt: raw.exercise_prompt || raw.prompt || raw.description || "",
  };
}

export default function StudentPlay() {
  const router = useRouter();

  const [student,         setStudent]         = useState<any>(null);
  const [exercise,        setExercise]        = useState<ExerciseData | null>(null);
  const [difficulty,      setDifficulty]      = useState("beginner");
  const [answers,         setAnswers]         = useState<string[]>([]);
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [feedback,        setFeedback]        = useState<FeedbackState | null>(null);
  const [hintVisible,     setHintVisible]     = useState(false);
  const [hintUsed,        setHintUsed]        = useState(false);
  const [questionNumber,  setQuestionNumber]  = useState(1);
  const [score,           setScore]           = useState(0);
  const [finished,        setFinished]        = useState(false);

  useEffect(() => {
    const localData = localStorage.getItem("mindrace_student");
    if (!localData || localData === "undefined") {
      localStorage.removeItem("mindrace_student");
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(localData);
      setStudent(parsed);
      setScore(parsed.score || 0);
      loadExercise(parsed.language || "python", "beginner");
    } catch {
      router.push("/");
    }
  }, []);

  const loadExercise = useCallback(async (lang: string, diff: string) => {
    setLoadingExercise(true);
    setFeedback(null);
    setAnswers([]);
    setHintVisible(false);
    setHintUsed(false);

    try {
      // 🔥 FIX 1: Forzamos variedad enviando un tema (concept) aleatorio a la IA
      const conceptos = ["variables", "condicionales", "bucles", "funciones", "matemática básica", "arrays/listas", "lógica booleana"];
      const conceptoRandom = conceptos[Math.floor(Math.random() * conceptos.length)];

      const res  = await fetch("/api/exercise", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ language: lang, difficulty: diff, concept: conceptoRandom }),
      });
      
      if (!res.ok) throw new Error("Fallo en la API");

      const data = await res.json();
      const raw: ExerciseData = data.exercise ?? data;
      const ex = normalise(raw);
      const count = (ex.starter_code?.match(/\[BLANK\]/g) ?? []).length || 1;
      setAnswers(Array(count).fill(""));
      setExercise(ex);
    } catch {
      const fb: ExerciseData = {
        title:           "Variables en Python",
        description:     "Asigná el valor 42 a la variable 'respuesta' e imprimila.",
        starter_code:    "respuesta = [BLANK]\nprint([BLANK])",
        hint:            "Usá el número 42 y el nombre de la variable.",
        exercise_prompt: "Completá los dos blanks.",
      };
      setAnswers(["", ""]);
      setExercise(fb);
    } finally {
      setLoadingExercise(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || answers.some(a => !a.trim()) || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    const studentId = student?.id         ?? student?.student?.id;
    const sessionId = student?.session_id ?? student?.student?.session_id;
    const lang      = student?.language   ?? student?.student?.language ?? "python";
    const prompt    = exercise.exercise_prompt ?? exercise.description ?? "";
    const code      = exercise.starter_code ?? "";
    
    // 🔥 FIX 2: Si la IA no mandó [BLANK], mandamos la respuesta del alumno tal cual está,
    // en lugar de mandar el código intacto.
    let filled = "";
    if (code.includes(BLANK)) {
      filled = answers.reduce((acc, val) => acc.replace(BLANK, val), code);
    } else {
      filled = answers[0] || "";
    }

    try {
      const res  = await fetch("/api/answer", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          student_id:      studentId,
          session_id:      sessionId,
          exercise_prompt: prompt,
          starter_code:    code,
          student_answer:  filled,
          language:        lang,
          hint_used:       hintUsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar");

      const { diagnosis } = data;
      if (diagnosis.is_correct) {
        const pts = hintUsed ? 5 : 10;
        setScore(s => s + 10);
        setFeedback({ success: true, msg: `¡Correcto! +10 XP 🏎️💨`, explanation: diagnosis.error_explanation ?? "" });
        if (diagnosis.next_difficulty && diagnosis.next_difficulty.toUpperCase() !== "SAME") {
          setDifficulty(diagnosis.next_difficulty);
        }
      } else {
        setFeedback({ success: false, msg: "Casi… revisá tu respuesta.", explanation: diagnosis.error_explanation ?? "", error_type: diagnosis.error_type ?? "" });
      }
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message ?? "Error de conexión." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (questionNumber >= MAX_QUESTIONS) { setFinished(true); return; }
    setQuestionNumber(n => n + 1);
    loadExercise(student?.language ?? "python", difficulty);
  };

  const renderCodePreview = () => {
    if (!exercise?.starter_code)
      return <p className="text-gray-500 italic text-sm">Cargando código…</p>;

    const parts = exercise.starter_code.split(BLANK);

    return (
      <pre className="font-mono text-sm leading-loose text-[#e6edf3] whitespace-pre-wrap break-words">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              answers[i]?.trim()
                ? <span className="text-[#3ddc84] font-bold bg-[#3ddc84]/10 px-1 rounded">{answers[i]}</span>
                : <span className="text-[#3ddc84]/40 font-bold border border-dashed border-[#3ddc84]/30 px-2 rounded">espacio {i + 1}</span>
            )}
          </span>
        ))}
      </pre>
    );
  };

  // ── Finished screen ──────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-black mb-2 text-[#3ddc84]">¡Carrera terminada!</h1>
          <p className="text-gray-400 mb-6 text-sm">Completaste las {MAX_QUESTIONS} preguntas de la demo.</p>
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 mb-6">
            <span className="text-xs text-gray-400 block uppercase font-bold mb-1">Puntaje Final</span>
            <span className="text-5xl font-black text-[#3ddc84] font-mono">+{score} XP</span>
          </div>
          <button
            onClick={() => { setQuestionNumber(1); setScore(0); setFinished(false); loadExercise(student?.language ?? "python", "beginner"); }}
            className="w-full bg-[#3ddc84] text-[#0d1117] font-black py-3.5 rounded-xl hover:bg-[#2bb86a] transition-colors"
          >
            Correr de nuevo 🔄
          </button>
        </div>
      </div>
    );
  }

  if (!student) return <div className="p-8 text-center text-white bg-[#0d1117] min-h-screen">Cargando perfil…</div>;

  const lang      = student?.language ?? "python";
  const ext       = lang === "python" ? "py" : "js";
  const allFilled = answers.length > 0 && answers.every(a => a.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans flex flex-col">

      {/* ── Topbar ── */}
      <header className="w-full bg-[#161b22] border-b border-gray-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏁</span>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Piloto en Pista</p>
            <p className="text-base font-extrabold text-[#3ddc84] leading-none">{student.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <span key={i} className={`block rounded-full transition-all duration-300 ${
                i < questionNumber - 1 ? "w-2.5 h-2.5 bg-[#3ddc84]"
                : i === questionNumber - 1 ? "w-3 h-3 bg-[#3ddc84] ring-2 ring-[#3ddc84]/40"
                : "w-2 h-2 bg-gray-700"}`}
              />
            ))}
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-bold uppercase">Pregunta</span>
            <span className="text-sm font-black font-mono">{questionNumber}<span className="text-gray-600">/{MAX_QUESTIONS}</span></span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-bold uppercase">Nivel</span>
            <span className="text-sm font-semibold text-purple-400 uppercase">{difficulty}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-bold uppercase">XP</span>
            <span className="text-xl font-black text-[#3ddc84] font-mono">+{score}</span>
          </div>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* ── LEFT: descripción + inputs de respuesta ── */}
        <div className="md:col-span-1 bg-[#161b22] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">

          {loadingExercise ? (
            <div className="space-y-3 animate-pulse py-4">
              <div className="h-4 bg-gray-700 rounded w-2/3" />
              <div className="h-3 bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-700 rounded w-5/6" />
            </div>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 bg-[#1f6feb22] text-[#58a6ff] text-xs font-bold px-3 py-1 rounded-full border border-[#1f6feb44] w-fit">
                🚀 Desafío Activo
              </span>

              <h2 className="text-lg font-bold text-white leading-snug">
                {exercise?.title || "Desafío de código"}
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed">
                {exercise?.description || exercise?.exercise_prompt || "Completá los espacios en blanco del código."}
              </p>

              {/* ── Answer inputs — the real fields ── */}
              {!feedback?.success && (
                <div className="flex flex-col gap-3 mt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Completar espacios
                  </p>
                  {answers.map((val, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        <span className="text-[#3ddc84]/60">▸</span> espacio {i + 1}
                      </label>
                      <input
                        type="text"
                        value={val}
                        disabled={submitting}
                        autoFocus={i === 0 && !loadingExercise}
                        onChange={e => {
                          const next = [...answers];
                          next[i] = e.target.value;
                          setAnswers(next);
                        }}
                        onKeyDown={e => {
                          // Tab to next blank, Enter on last to submit
                          if (e.key === "Enter" && i === answers.length - 1 && allFilled) {
                            e.preventDefault();
                            document.getElementById("submit-btn")?.click();
                          }
                        }}
                        placeholder={`Escribí lo que va en el espacio ${i + 1}…`}
                        className="
                          w-full px-3 py-2.5
                          bg-[#0d1117] border-2 border-gray-700
                          hover:border-[#3ddc84]/40 focus:border-[#3ddc84]
                          text-[#3ddc84] font-mono font-bold text-sm rounded-xl
                          outline-none focus:ring-2 focus:ring-[#3ddc84]/20
                          placeholder:text-gray-600 placeholder:font-normal
                          transition-all disabled:opacity-50
                        "
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Hint */}
              {exercise?.hint && !hintVisible && !feedback?.success && (
                <button
                  onClick={() => {
                    if (!hintVisible) {
                      setHintVisible(true); 
                      setHintUsed(true);
                      // Restamos 5XP en vivo (y evitamos que baje de 0 por las dudas)
                      setScore(prev => Math.max(0, prev - 5)); 
                    }
                  }}
                  className="flex items-center gap-2 text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-400/20 hover:border-yellow-400/50 bg-yellow-950/20 hover:bg-yellow-950/40 rounded-xl px-3 py-2.5 transition-all w-full"
                >
                  <span className="text-base">💡</span>
                  <span className="font-semibold">Ver pista</span>
                  <span className="ml-auto text-yellow-400/40 font-mono">−5 XP</span>
                </button>
              )}

              {hintVisible && exercise?.hint && (
                <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-yellow-400 mb-1">
                    💡 Pista <span className="text-yellow-400/40 font-normal">(−5 XP)</span>
                  </p>
                  <p className="text-xs text-yellow-200/70 leading-relaxed">{exercise.hint}</p>
                </div>
              )}
            </>
          )}

          <div className="flex-1" />

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-xl text-sm border ${
              feedback.success
                ? "bg-green-950/30 border-green-500/20 text-green-300"
                : "bg-red-950/30 border-red-500/20 text-red-300"
            }`}>
              <p className="font-bold mb-1">{feedback.msg}</p>
              {feedback.error_type && !feedback.success && (
                <p className="text-xs font-mono text-red-400/70 mb-1">tipo: {feedback.error_type}</p>
              )}
              {feedback.explanation && (
                <p className="text-xs text-gray-400 leading-relaxed mt-1">{feedback.explanation}</p>
              )}
              {feedback.success ? (
                <button onClick={handleNext} className="w-full mt-3 bg-[#3ddc84] hover:bg-[#2bb86a] text-[#0d1117] font-black py-2.5 rounded-lg transition-colors text-sm">
                  {questionNumber >= MAX_QUESTIONS ? "Ver resultado final 🏆" : "Siguiente tramo →"}
                </button>
              ) : (
                <button onClick={() => setFeedback(null)} className="w-full mt-2 border border-red-500/20 text-red-300 hover:bg-red-950/30 font-semibold py-2 rounded-lg transition-colors text-xs">
                  Intentar de nuevo 🔄
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: code preview ── */}
        <div className="md:col-span-2 flex flex-col bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">

          <div className="bg-[#161b22] px-4 py-2.5 flex items-center border-b border-gray-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-400 ml-3 font-mono">editor_de_carreras.{ext}</span>
            </div>
            <span className="ml-auto text-[10px] font-mono text-gray-600">
              {answers.filter(a => a.trim()).length}/{answers.length} completados
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 gap-4">


            {/* --- PISTA DE CARRERAS ANIMADA (EL AUTO) --- */}
            
              {/* PISTA DE CARRERAS ESTILO VIDEOJUEGO 2D (ARCADE) */}
              <div className="bg-[#1e3a8a] h-32 rounded-xl relative overflow-hidden flex flex-col justify-end border-2 border-[#30363d] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">

                {/* Cielo gradiente */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e3a8a]"></div>

                {/* Montañas de fondo retro (Siluetas) */}
                <div className="absolute bottom-16 w-full flex justify-around opacity-40">
                  <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-l-transparent border-r-transparent border-b-[#090d13] ml-4"></div>
                  <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-b-[80px] border-l-transparent border-r-transparent border-b-[#0d1117]"></div>
                  <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-[#090d13] mr-10"></div>
                </div>

                {/* Asfalto / Carretera */}
                <div className="h-16 w-full bg-[#1a202c] relative border-t-4 border-[#22c55e] shadow-[0_-2px_10px_rgba(34,197,94,0.2)]">
                  
                  {/* Líneas de la calle centrales */}
                  <div className="absolute top-1/2 w-full border-t-[3px] border-dashed border-gray-400 opacity-60"></div>

                  {/* Checkpoints invisibles o marcas en el asfalto */}
                  {[...Array(MAX_QUESTIONS)].map((_, i) => (
                    <div key={i} 
                        className="absolute top-0 bottom-0 w-1 bg-white/5"
                        style={{ left: `${(i / MAX_QUESTIONS) * 85}%` }}>
                    </div>
                  ))}

                  {/* Línea de meta (Bandera a cuadros con CSS Grid) */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 grid grid-cols-2 border-l-4 border-yellow-400 z-0">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`w-full h-full ${ (i + Math.floor(i / 2)) % 2 === 0 ? 'bg-white' : 'bg-black'}`}></div>
                    ))}
                  </div>

                  {/* EL AUTO ANIMADO */}
                  <div 
                    className={`absolute transition-all duration-1000 ease-in-out z-10 flex items-center ${submitting ? 'animate-bounce' : ''}`}
                    style={{ 
                      left: `${((questionNumber - 1) / MAX_QUESTIONS) * 85}%`,
                      bottom: '8px' // Alineado en el carril inferior de la pista
                    }}
                  >
                    {/* Fuego del escape (Sale por la IZQUIERDA ahora) */}
                    <div className={`h-3 w-10 bg-gradient-to-r from-transparent via-orange-500 to-yellow-300 rounded-full absolute left-[-25px] bottom-[4px] blur-[1px] transition-all duration-500 origin-right
                      ${feedback?.success ? 'opacity-100 scale-x-100 animate-pulse' : 'opacity-0 scale-x-0'}`}>
                    </div>
                    
                    {/* Auto Vectorial 2D (Mirando a la derecha) */}
                    <svg width="50" height="24" viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                      {/* Alerón trasero */}
                      <rect x="0" y="6" width="6" height="4" rx="1" fill="#b91c1c" />
                      <rect x="2" y="10" width="2" height="4" fill="#b91c1c" />
                      
                      {/* Chasis principal */}
                      <rect x="4" y="10" width="42" height="8" rx="2" fill="#ef4444" />
                      
                      {/* Cabina / Vidrios */}
                      <path d="M14 10 L18 4 h12 l6 6 H14 z" fill="#ef4444" />
                      <path d="M16 9 L19 5 h9 l4 4 H16 z" fill="#9ca3af" />
                      
                      {/* Luz delantera */}
                      <rect x="44" y="12" width="3" height="4" rx="1" fill="#fef08a" />
                      
                      {/* Ruedas */}
                      <circle cx="12" cy="18" r="4.5" fill="#111827" />
                      <circle cx="12" cy="18" r="1.5" fill="#d1d5db" />
                      
                      <circle cx="36" cy="18" r="4.5" fill="#111827" />
                      <circle cx="36" cy="18" r="1.5" fill="#d1d5db" />
                    </svg>
                  </div>

                </div>
              </div>
              {/* ------------------------------------------- */}

            {/* Live code preview */}
            <div className="bg-[#090d13] p-5 rounded-xl border border-gray-900 shadow-inner flex-1 min-h-[220px] overflow-x-auto">
              {loadingExercise ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-800 rounded w-5/6" />
                </div>
              ) : (
                renderCodePreview()
              )}
            </div>

            {!loadingExercise && !feedback && (
              <p className="text-xs text-gray-600 text-center">
                ✏️ Escribí tu respuesta en los campos de la izquierda — el código se actualiza en tiempo real
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => loadExercise(lang, difficulty)}
                disabled={loadingExercise || submitting}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm rounded-xl transition-all disabled:opacity-40"
              >
                Saltar / Forzar otro 🔄
              </button>

              <button
                id="submit-btn"
                type="submit"
                disabled={submitting || loadingExercise || !allFilled || !!feedback?.success}
                className="
                  bg-[#3ddc84] hover:bg-[#2bb86a]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  text-[#0d1117] font-black tracking-wide
                  text-sm py-2.5 px-6 rounded-xl
                  transition-all duration-150 flex items-center gap-2
                  shadow-[0_0_20px_rgba(61,220,132,0.2)]
                "
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0d1117]/30 border-t-[#0d1117] rounded-full animate-spin" />
                    Procesando Motor…
                  </>
                ) : (
                  "Correr Carrera 🏁"
                )}
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
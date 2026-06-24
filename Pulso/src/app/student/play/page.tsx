"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExerciseData {
  title?: string;
  description?: string;
  exercise_prompt?: string;
  starter_code?: string; 
  prompt?: string;
  codeTemplate?: string;
}

export default function StudentPlay() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [difficulty, setDifficulty] = useState("beginner");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // 1. Validar login rápido e inicializar
  useEffect(() => {
    const localData = localStorage.getItem("mindrace_student");
    
    // 🔥 CONTROL DE SEGURIDAD: Si no existe o quedó guardado como "undefined" literal, redirige al login
    if (!localData || localData === "undefined") {
      localStorage.removeItem("mindrace_student"); // Limpiamos por las dudas
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(localData);
      setStudent(parsed);
      fetchNewExercise(parsed.language || "python", "beginner");
    } catch (err) {
      console.error("Error parseando el alumno de localStorage:", err);
      router.push("/");
    }
  }, []);

  // 2. Traer ejercicio dinámico de la IA
  const fetchNewExercise = async (lang: string, diff: string) => {
    setLoadingExercise(true);
    setFeedback(null);
    setStudentAnswer("");
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, difficulty: diff }),
      });
      const data = await res.json();
      if (data.exercise) {
        setExercise(data.exercise);
      } else {
        // Mock fallback de emergencia si falla la API Key temporalmente
        setExercise({
          title: "Desafío: Acelerar el bólido",
          description: `Completa la condición para que el auto avance 5 veces usando ${lang}.`,
          exercise_prompt: "Completar el bucle para iterar 5 veces.",
          starter_code: lang === "python" 
            ? "for i in range([BLANK]):\n    car.move()" 
            : "for (let i = 0; i < [BLANK]; i++) {\n    car.move();\n}"
        });
      }
    } catch (err) {
      console.error("Error cargando ejercicio:", err);
    } finally {
      setLoadingExercise(false);
    }
  };

  // 3. Enviar respuesta a boxes para diagnóstico de la IA
  const handleRunRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || !exercise) return;

    setSubmitting(true);
    setFeedback(null);

    // Extraemos los datos de forma robusta por si la IA o el Storage usan otras keys
    const realStudentId = student.id || student.student?.id;
    const realSessionId = student.session_id || student.student?.session_id;
    const realPrompt = exercise.prompt || exercise.exercise_prompt || exercise.description || "Ejercicio de código";
    const realCode = exercise.starter_code || exercise.codeTemplate || "";
    const realLang = student.language || student.student?.language || "python";

    const payload = {
      student_id: realStudentId,
      session_id: realSessionId,
      exercise_prompt: realPrompt,
      starter_code: realCode,
      student_answer: studentAnswer,
      language: realLang,
      hint_used: false,
    };

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al procesar respuesta");

      if (data.diagnosis.is_correct) {
        setFeedback({ success: true, msg: "¡Excelente! Código optimizado. El auto avanza a máxima velocidad. 🏎️💨" });
        setStudent((prev: any) => ({ ...prev, score: (prev.score || 0) + 10 }));
        
        if (data.diagnosis.next_difficulty) {
          setDifficulty(data.diagnosis.next_difficulty);
        }
      } else {
        setFeedback({ 
          success: false, 
          msg: `⚠️ Pit Stop (Error Tipo: ${data.diagnosis.error_type}): ${data.diagnosis.error_explanation}` 
        });
      }
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message || "Error de conexión con la pista." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!student) return <div className="p-8 text-center text-white bg-[#0d1117] min-h-screen">Cargando perfil de piloto...</div>;

  // Renderizar el código base reemplazando [BLANK] de forma segura sin romper la pantalla
  const renderCodeWithBlank = () => {
    if (!exercise) return null;

    const codeText = exercise.starter_code || exercise.codeTemplate || "";

    if (!codeText) {
      return <div className="text-gray-500 italic text-sm">Esperando estructura de código de boxes...</div>;
    }

    const parts = codeText.split("[BLANK]");
    
    if (parts.length === 1) {
      return (
        <div className="space-y-4">
          <pre className="font-mono text-sm leading-relaxed text-[#e6edf3] whitespace-pre-wrap">
            {codeText}
          </pre>
          <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
            <span className="text-xs text-gray-400 font-mono">Tu solución:</span>
            <input
              type="text"
              value={studentAnswer}
              disabled={submitting}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Completa la solución aquí"
              className="flex-1 max-w-xs px-3 py-1 bg-[#1f6feb33] border border-[#1f6feb] text-[#58a6ff] rounded font-bold outline-none focus:ring-2 focus:ring-[#3ddc84]"
            />
          </div>
        </div>
      );
    }

    return (
      <pre className="font-mono text-sm leading-relaxed text-[#e6edf3] whitespace-pre-wrap">
        {parts[0]}
        <input
          type="text"
          value={studentAnswer}
          disabled={submitting}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="?"
          className="inline-block mx-1 px-2 py-0.5 min-w-[60px] w-auto max-w-[150px] bg-[#1f6feb33] border border-[#1f6feb] text-[#58a6ff] rounded font-bold text-center outline-none focus:ring-2 focus:ring-[#3ddc84] animate-pulse transition-all"
        />
        {parts[1]}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans flex flex-col">
      {/* Telemetría / Barra Superior del Piloto */}
      <header className="w-full bg-[#161b22] border-b border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏁</div>
          <div>
            <h1 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Piloto en Pista</h1>
            <p className="text-lg font-extrabold text-[#3ddc84]">{student.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-bold uppercase">Lenguaje</span>
            <span className="text-sm font-semibold bg-gray-800 px-2.5 py-1 rounded text-orange-400 tracking-wide uppercase font-mono">{student.language}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-bold uppercase">Nivel Actual</span>
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">{difficulty}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-bold uppercase">Puntaje</span>
            <span className="text-xl font-black text-[#3ddc84] font-mono">+{student.score || 0} XP</span>
          </div>
        </div>
      </header>

      {/* Grid Central */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: El Desafío */}
        <div className="md:col-span-1 bg-[#161b22] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          {loadingExercise ? (
            <div className="space-y-4 animate-pulse py-8">
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              <div className="h-3 bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#1f6feb22] text-[#58a6ff] text-xs font-bold px-3 py-1 rounded-full mb-4 border border-[#1f6feb44]">
                🚀 Desafío Activo
              </div>
              <h2 className="text-xl font-bold mb-3 text-white">{exercise?.title}</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{exercise?.description}</p>
            </div>
          )}

          {/* Estado de la carrera (Feedback) */}
          {feedback && (
            <div className={`p-4 rounded-xl text-xs font-medium border mt-4 ${
              feedback.success 
                ? "bg-green-950/40 border-green-500/30 text-green-400" 
                : "bg-red-950/40 border-red-500/30 text-red-400"
            }`}>
              {feedback.msg}
              {feedback.success && (
                <button
                  onClick={() => fetchNewExercise(student.language, difficulty)}
                  className="w-full mt-3 bg-[#3ddc84] hover:bg-[#2bb86a] text-[#0d1117] font-bold py-2 rounded-lg transition-colors text-center"
                >
                  Siguiente Tramo de Pista ➡️
                </button>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha / Centro: Consola Editor de Código */}
        <div className="md:col-span-2 flex flex-col bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#161b22] px-4 py-2.5 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="text-xs text-gray-400 ml-2 font-mono">editor_de_carreras.{student.language === 'python' ? 'py' : 'js'}</span>
            </div>
          </div>

          <form onSubmit={handleRunRace} className="flex-1 flex flex-col p-6 justify-between gap-6">
            <div className="bg-[#090d13] p-6 rounded-xl border border-gray-900 font-mono shadow-inner min-h-[180px]">
              {loadingExercise ? (
                <div className="text-gray-600 text-sm animate-pulse">Cargando telemetría de código...</div>
              ) : (
                renderCodeWithBlank()
              )}
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => fetchNewExercise(student.language, difficulty)}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm rounded-xl transition-all"
              >
                Saltar / Forzar otro 🔄
              </button>
              <button
                type="submit"
                disabled={submitting || loadingExercise || feedback?.success}
                className="bg-[#3ddc84] hover:bg-[#2bb86a] disabled:opacity-40 text-[#0d1117] font-black tracking-wide text-sm py-3 px-6 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-[0_0_20px_rgba(61,220,132,0.2)]"
              >
                {submitting ? "Procesando Motor..." : "Correr Carrera 🏁"}
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
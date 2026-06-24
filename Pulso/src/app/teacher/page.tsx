"use client";

import { useState } from "react";

export default function TeacherCreate() {
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_name: teacherName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo crear el aula");

      setSession(data.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white text-[#1a1a2e] rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        
        <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.9V17h2V9L12 3z"/></svg>
          Educator Control Room
        </div>

        {!session ? (
          <>
            <h2 className="text-2xl font-bold mb-1">Abrir una nueva <span className="text-purple-600">Sala de Carrera</span></h2>
            <p className="text-gray-500 text-sm mb-6">Crea un aula instantánea sin contraseñas para tus alumnos.</p>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-xs">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Nombre del Profesor/a</label>
                <input 
                  type="text" required placeholder="Ej: Profe Julia"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 mt-6 shadow-md disabled:opacity-50"
              >
                {loading ? "Configurando pista..." : "Generar Código de Aula ⚡"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Aula Creada con Éxito! 🎉</h3>
            <p className="text-gray-500 text-sm mb-6">Compartí este PIN con tus alumnos para que empiecen a correr:</p>
            
            <div className="bg-[#0d1117] text-[#3ddc84] font-mono text-4xl font-extrabold tracking-widest py-4 px-6 rounded-2xl mb-6 shadow-inner select-all">
              {session.code}
            </div>

            <p className="text-xs text-gray-400 mb-6">Instructor: {session.teacher_name}</p>

            <button 
              onClick={() => window.location.href = `/teacher/dashboard?code=${session.code}`}
              className="w-full bg-[#0d1117] text-white hover:bg-[#161b22] font-semibold py-3 px-4 rounded-xl transition-all"
            >
              Ir al Tablero en Vivo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
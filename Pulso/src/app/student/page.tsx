"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentJoin() {
  const router = useRouter();
  // Agregamos "difficulty" por defecto en "beginner"
  const [formData, setFormData] = useState({ name: "", sessionCode: "", language: "python", difficulty: "beginner" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Código de aula incorrecto");

      const studentData = data.student || data;
      // Guardamos TODOS los datos elegidos en localStorage
      const finalStudent = { 
        ...studentData, 
        language: formData.language, 
        difficulty: formData.difficulty 
      };

      localStorage.setItem("mindrace_student", JSON.stringify(finalStudent));
      router.push("/student/play");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white text-[#1a1a2e] rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Configura tu Carrera</h2>
        
        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-4 text-xs font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Tu Nombre</label>
            <input 
              type="text" required placeholder="Ej: RayoMcQueen"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black font-medium outline-none focus:ring-2 focus:ring-[#3ddc84]"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">PIN del Aula</label>
            <input 
              type="text" required maxLength={6} placeholder="MIND24"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-[#3ddc84]"
              value={formData.sessionCode} onChange={(e) => setFormData({...formData, sessionCode: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Lenguaje</label>
              <select 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#3ddc84]"
                value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            
            {/* NUEVO SELECTOR DE DIFICULTAD */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Dificultad</label>
              <select 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#3ddc84]"
                value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="beginner">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#0d1117] text-[#3ddc84] hover:bg-[#161b22] font-bold py-3.5 px-4 rounded-xl mt-6">
            {loading ? "Entrando..." : "Iniciar Carrera 🏁"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentJoin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", sessionCode: "", language: "python" });
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

      localStorage.setItem("mindrace_student", JSON.stringify(data));
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
        
        <div className="inline-flex items-center gap-1.5 bg-[#e8fbf0] text-[#2bb86a] text-xs font-bold px-3 py-1 rounded-full mb-4">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16l-3 7 3 7H4V4z"/></svg>
          Player Registration
        </div>
        
        <h2 className="text-2xl font-bold mb-1">Ready to race? <span className="text-[#2bb86a]">Let's go!</span></h2>
        <p className="text-gray-500 text-sm mb-6">Completá tus datos para ingresar al circuito de código.</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Tu Nombre / Nickname</label>
            <input 
              type="text" required placeholder="Ej: RayoMcQueen"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-[#3ddc84] focus:border-[#3ddc84] outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">PIN del Aula (6 Letras)</label>
            <input 
              type="text" required maxLength={6} placeholder="MIND24"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#3ddc84] focus:border-[#3ddc84] outline-none transition-all"
              value={formData.sessionCode}
              onChange={(e) => setFormData({...formData, sessionCode: e.target.value.toUpperCase()})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Tecnología / Lenguaje</label>
            <select 
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-[#3ddc84] outline-none appearance-none cursor-pointer"
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
            >
              <option value="python">Python 🐍</option>
              <option value="javascript">JavaScript 🟨</option>
            </select>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#0d1117] hover:bg-[#161b22] text-[#3ddc84] border border-transparent hover:border-[#3ddc84] font-bold py-3.5 px-4 rounded-xl transition-all duration-200 mt-6 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Verificando motor..." : "Iniciar Carrera 🏁 →"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TeacherDashboard() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("code");

  const [session, setSession] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Resolver el código de sala para obtener el session_id
  useEffect(() => {
    if (!roomCode) {
      setError("Falta el código de la sala en la URL.");
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const res = await fetch(`/api/sessions?code=${roomCode}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sala no encontrada");
        setSession(data.session);
        
        // Carga inicial inmediata
        fetchDashboardMetrics(data.session.id);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    initSession();
  }, [roomCode]);

  // 2. Pooling en tiempo real: consulta métricas cada 4 segundos
  useEffect(() => {
    if (!session?.id) return;

    const interval = setInterval(() => {
      fetchDashboardMetrics(session.id);
    }, 4000);

    return () => clearInterval(interval);
  }, [session]);

  const fetchDashboardMetrics = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/dashboard?session_id=${sessionId}`);
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Error en pooling del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-white bg-[#0d1117] min-h-screen">Conectando con la torre de control de MindRace...</div>;
  if (error) return <div className="p-12 text-center text-red-400 bg-[#0d1117] min-h-screen">⚠️ Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans p-6">
      
      {/* Cabecera del Profesor */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-950/50 border border-purple-800/40 px-3 py-1 rounded-full">Torre de Control en Vivo</span>
          <h1 className="text-3xl font-extrabold mt-2">Profesor: <span className="text-[#3ddc84]">{session?.teacher_name}</span></h1>
          <p className="text-gray-400 text-sm mt-1">Monitoreo de dificultades e interrupciones en tiempo real asistido por IA.</p>
        </div>

        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 flex items-center gap-6 shadow-lg">
          <div className="text-center">
            <span className="text-xs font-bold text-gray-400 block uppercase">PIN DE ACCESO</span>
            <span className="text-3xl font-mono font-black text-[#3ddc84] tracking-widest select-all">{roomCode}</span>
          </div>
        </div>
      </header>

      {/* KPIs Principales */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Total de Alumnos</span>
          <span className="text-4xl font-extrabold text-white font-mono">{dashboardData?.total_students || 0}</span>
        </div>
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Corredores Activos (Últ. 5 min)</span>
          <span className="text-4xl font-extrabold text-[#3ddc84] font-mono">{dashboardData?.active_students || 0}</span>
        </div>
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Estado de Red</span>
            <span className="text-sm font-semibold text-green-400 flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              Sincronizado
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla / Ranking de Alumnos */}
        <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🏁</span> Estado de los Competidores
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs font-bold uppercase">
                  <th className="py-3 px-4">Piloto</th>
                  <th className="py-3 px-4">Lenguaje</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Último Alerta de IA</th>
                  <th className="py-3 px-4 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {dashboardData?.students && dashboardData.students.length > 0 ? (
                  dashboardData.students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">{student.name}</td>
                      <td className="py-4 px-4 font-mono text-xs"><span className="bg-gray-900 px-2 py-0.5 rounded text-gray-300 uppercase">{student.language}</span></td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-[#3ddc84]">{student.score} XP</td>
                      <td className="py-4 px-4 text-xs text-gray-400 max-w-[180px] truncate">
                        {student.last_error_type && student.last_error_type !== 'none' ? (
                          <span className="text-red-300 font-mono bg-red-950/50 px-2 py-0.5 rounded border border-red-900/30">{student.last_error_type}</span>
                        ) : (
                          <span className="text-gray-500 italic">Ninguno</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {student.status === "struggling" ? (
                          <span className="inline-block bg-red-950/70 text-red-400 font-bold border border-red-500/30 rounded-lg px-2.5 py-1 text-xs animate-pulse">
                            🚨 Auxilio en Boxes
                          </span>
                        ) : student.status === "ok" ? (
                          <span className="inline-block bg-green-950/40 text-green-400 font-medium rounded-lg px-2.5 py-1 text-xs">
                            🟢 Volando
                          </span>
                        ) : (
                          <span className="inline-block bg-gray-800 text-gray-400 rounded-lg px-2.5 py-1 text-xs">
                            ⚪ Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 italic">Esperando que se unan alumnos a la pista...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de Errores Comunes Diagnósticos por GPT */}
        <div className="lg:col-span-1 bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <span>📊</span> Alertas de Fricción
            </h2>
            <p className="text-xs text-gray-400 mb-4">¿Dónde se están trabando más tus estudiantes?</p>

            <div className="space-y-3">
              {dashboardData?.error_summary && dashboardData.error_summary.length > 0 ? (
                dashboardData.error_summary.map((err: any, idx: number) => (
                  <div key={idx} className="bg-[#0d1117] border border-gray-800 p-3 rounded-xl flex items-center justify-between">
                    <div className="pr-2">
                      <span className="text-xs font-mono text-red-400 block font-bold">{err.error_type}</span>
                      <span className="text-xs text-gray-300">{err.label}</span>
                    </div>
                    <span className="bg-red-950 border border-red-800 text-red-400 font-mono text-xs font-black rounded-lg px-2.5 py-1.5 shrink-0">
                      {err.count} {err.count === 1 ? 'alumno' : 'alumnos'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-500 italic">Sin anomalías ni errores detectados hasta ahora. ¡Pista limpia! 🟢</div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-6">
            <div className="text-[11px] text-gray-500 leading-relaxed">
              * El sistema actualiza de forma automática cada 4 segundos sin necesidad de recargar la ventana. El estado <b className="text-red-400">Auxilio en Boxes</b> se activa si un alumno falla consecutivamente en los últimos 3 minutos.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans flex flex-col items-center justify-start px-4 py-8 relative overflow-hidden">
      
      {/* Navbar Original */}
      <nav className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-gray-800 mb-12">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="w-8 h-8 text-[#3ddc84]">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5 5.5 3 7 3 9.5C3 11.5 4 13 5.5 13.5C5 14.5 5 15.5 5.5 16.5C6 18 7.5 19 9 19H12V21H14V19H15C16.5 19 18 18 18.5 16.5C19 15.5 19 14.5 18.5 13.5C20 13 21 11.5 21 9.5C21 7 19 5.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
            </svg>
          </div>
          <span>Mind<em className="text-[#3ddc84] not-italic font-extrabold">Race</em></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1a2333] border border-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#3ddc84] animate-pulse"></span>
            Hackathon Mode
          </div>
        </div>
      </nav>

      {/* Hero Central */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 text-[#3ddc84] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(61,220,132,0.4)]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5 5.5 3 7 3 9.5C3 11.5 4 13 5.5 13.5C5 14.5 5 15.5 5.5 16.5C6 18 7.5 19 9 19H12V21H14V19H15C16.5 19 18 18 18.5 16.5C19 15.5 19 14.5 18.5 13.5C20 13 21 11.5 21 9.5C21 7 19 5.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">Mind<span className="text-[#3ddc84]">Race</span></h1>
        <p className="text-gray-400 text-lg font-medium">Code. Race. Win.</p>
        {/* --- DESCRIPCIÓN DEL PROYECTO (HERO) --- */}
        <div className="text-center max-w-2xl mx-auto mb-10 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#3ddc84] to-[#4ade80] mb-4 drop-shadow-lg">
            Aprende a programar a toda velocidad.
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            MindRace es la plataforma interactiva donde nuestra API de ChatGPT lanza desafíos de código y los docentes pueden ver el progreso tiempo real. Los alumnos pueden opcionalmente competir por ser los primeros en cruzar la meta. <strong className="text-gray-200">Ingresa tu código de sesión y encendé los motores.</strong>
          </p>
          
          {/* Etiquetas/Badges para dar más contexto rápido */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300 font-medium">🎮 Gamificado</span>
            <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300 font-medium">⚡ Tiempo Real</span>
            <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300 font-medium">🤖 Feedback IA</span>
          </div>
        </div>
        {/* --------------------------------------- */}
      </div>

      {/* Menú de Selección */}
      <div className="bg-white text-[#1a1a2e] rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        <div className="inline-flex items-center gap-1.5 bg-[#e8fbf0] text-[#2bb86a] text-xs font-bold px-3 py-1 rounded-full mb-4">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16l-3 7 3 7H4V4z"/></svg>
          Select Role
        </div>
        <h2 className="text-2xl font-bold mb-6">¿Quién ingresa a la pista?</h2>

        <div className="flex flex-col gap-4">
          <Link 
            href="/student"
            className="group flex items-center justify-between bg-[#0d1117] text-white hover:bg-[#161b22] font-semibold py-4 px-5 rounded-xl transition-all duration-200 shadow-md"
          >
            <span>Soy Alumno (Corredor)</span>
            <span className="text-[#3ddc84] group-hover:translate-x-1 transition-transform">🏁 →</span>
          </Link>

          <Link 
            href="/teacher"
            className="group flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-[#1a1a2e] font-semibold py-4 px-5 rounded-xl transition-all duration-200 border border-gray-300"
          >
            <span>Soy Profesor (Director)</span>
            <span className="text-gray-500 group-hover:translate-x-1 transition-transform">⏱️ →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
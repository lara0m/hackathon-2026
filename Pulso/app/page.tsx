import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleTeacherAction = () => {
    router.push('/docente');
  };

  const handleStudentAction = () => {
    router.push('/alumno');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] text-[#1A1A18]">
      <h1 className="text-4xl font-bold">Pulso</h1>
      <p className="mt-4 text-lg">Aprendizaje personalizado</p>
      <div className="mt-8 flex space-x-4">
        <button onClick={handleTeacherAction} className="p-4 bg-blue-500 text-white rounded">
          Acciones para Docentes
        </button>
        <button onClick={handleStudentAction} className="p-4 bg-green-500 text-white rounded">
          Acciones para Estudiantes
        </button>
      </div>
    </div>
  );
}
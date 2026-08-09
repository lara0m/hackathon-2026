import React, { Suspense } from 'react';
import TeacherDashboardClient from './TeacherDashboard.client';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white bg-[#0d1117] min-h-screen">Conectando con la torre de control de MindRace...</div>}>
      <TeacherDashboardClient />
    </Suspense>
  );
}

// src/app/admin/data-siswa/page.tsx
import { getAllStudents, getFormDataReferences } from "@/app/actions/students"; // Contoh action
import DataSiswaClient from "@/components/dashboard/DataSiswaClient";
import DashboardHeader from "@/components/dashboard/header";

export default async function DataSiswaPage() {
  const [students, refs] = await Promise.all([
    getAllStudents(),
    getFormDataReferences() // Kita buat fungsi ini di actions
  ]);
  return (
    <div className="min-h-screen  p-4">
        <DashboardHeader title="Database Siswa"  />
      

      <DataSiswaClient 
        initialStudents={students} 
        locations={refs.locations}
        packages={refs.packages}
        subjects={refs.subjects}
      />
    </div>
  );
}
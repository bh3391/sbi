// src/app/admin/data-siswa/page.tsx
import { auth } from "@/lib/auth";
import { getAllStudents, getFormDataReferences } from "@/app/actions/students"; // Contoh action
import DataSiswaClient from "@/components/dashboard/DataSiswaClient";
import DashboardHeader from "@/components/dashboard/header";

export default async function DataSiswaPage() {
  const [students, refs] = await Promise.all([
    getAllStudents(),
    getFormDataReferences(), // Kita buat fungsi ini di actions
  ]);
  const session = await auth();
  const user = session?.user?.id;
  const role = session?.user?.role;

  return (
    <div className="min-h-screen  p-1 mb-1">
      <DashboardHeader userId={"user"} title="Database Siswa" />

      <DataSiswaClient
        initialStudents={students}
        locations={refs.locations}
        packages={refs.packages}
        subjects={refs.subjects}
        addOns={refs.addOns}
        role={role}
      />
    </div>
  );
}

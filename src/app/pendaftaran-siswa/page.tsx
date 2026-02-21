// src/app/pendaftaran-siswa/page.tsx
import { getFormDataReferences } from "@/app/actions/students";
import PendaftaranClient from "./PendaftaranClient";

export default async function PendaftaranPublicPage() {
  const refs = await getFormDataReferences();

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-fuchsia-200">
      <PendaftaranClient 
        locations={refs.locations} 
        packages={refs.packages} 
        subjects={refs.subjects} 
      />
    </main>
  );
}
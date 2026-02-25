import { getAllTeachers } from "@/app/actions/users";
import { getAllLocations } from "@/app/actions/locations"; // Asumsi fungsi ini ada
import DataGuruClient from "./DataGuruClient";
import DashboardHeader from "@/components/dashboard/header";

export default async function DataGuruPage() {
  const [teachers, locations] = await Promise.all([
    getAllTeachers(),
    getAllLocations()
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-100 to-fuchsia-50  pb-20">
        <DashboardHeader title="Database Guru"  />
      <DataGuruClient teachers={teachers} locations={locations} />
    </main>
  );
}
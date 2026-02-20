import { getTeacherDashboardData } from "@/app/actions/teacher";
import GuruAbsensiClient from "@/components/dashboard/GuruAbsensiClient";

export default async function Page() {
  const data = await getTeacherDashboardData();
  
  if (!data) return null;

  return <GuruAbsensiClient initialData={data} />;
}
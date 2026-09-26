import { getLectureById } from "@/lib/mock-hemis";
import LecturePage from "./LecturePage";
import LiveOrArchive from "./LiveOrArchive";

export const dynamic = "force-dynamic";

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { teacher?: string };
}) {
  if (getLectureById(params.id)) {
    return <LecturePage />;
  }
  return <LiveOrArchive lectureId={params.id} canEdit={searchParams?.teacher === "1"} />;
}
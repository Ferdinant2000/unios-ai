import { LECTURES } from "@/lib/mock-hemis";
import LecturePage from "./LecturePage";

export const dynamicParams = true;

export function generateStaticParams() {
  return LECTURES.map((lecture) => ({
    id: lecture.id,
  }));
}

export default function Page() {
  return <LecturePage />;
}

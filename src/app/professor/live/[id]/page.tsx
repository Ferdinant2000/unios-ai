import { COURSES } from "@/lib/mock-hemis";
import LiveLecturePageClient from "./LiveLecturePage";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((course) => ({
    id: course.id,
  }));
}

export default function Page() {
  return <LiveLecturePageClient />;
}

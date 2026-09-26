"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { STUDENT } from "@/lib/mock-hemis";
import { DEMO_TEACHER_ID } from "@/lib/firebase";
import type { LiveLecture } from "@/lib/live";
import { subscribeLiveLecture } from "@/lib/live";
import Header from "@/components/layout/Header";
import LiveStudentView from "./LiveStudentView";
import ArchiveLectureView from "./ArchiveLectureView";

export default function LecturePage() {
  const params = useParams<{ id: string }>();
  const lectureId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { t } = useLanguage();
  const { user, isDemo } = useAuth();

  const [liveLecture, setLiveLecture] = useState<LiveLecture | null>(null);
  const [liveLoaded, setLiveLoaded] = useState(false);

  useEffect(() => {
    setLiveLoaded(false);
    const off = subscribeLiveLecture(lectureId, (lec) => {
      setLiveLecture(lec);
      setLiveLoaded(true);
    });
    return off;
  }, [lectureId]);

  const isLive =
    liveLecture?.status === "live" || liveLecture?.status === "waiting";

  const canEdit =
    liveLecture?.status === "ended" &&
    (isDemo
      ? liveLecture.teacherId === DEMO_TEACHER_ID
      : user?.role === "professor" && liveLecture.teacherId === user.uid);

  if (!liveLoaded) {
    return (
      <main className="min-h-screen">
        <Header showBack user={STUDENT} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center text-sm text-slate-400 dark:text-zinc-500">
            {t("loading")}
          </div>
        </div>
      </main>
    );
  }

  if (liveLecture && isLive) {
    return <LiveStudentView lectureId={lectureId} lecture={liveLecture} />;
  }

  return <ArchiveLectureView lectureId={lectureId} canEdit={canEdit} />;
}
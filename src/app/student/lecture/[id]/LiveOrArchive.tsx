"use client";

import { useEffect, useState } from "react";
import { subscribeLiveLecture, type LiveLecture } from "@/lib/live";
import ArchiveLectureView from "./ArchiveLectureView";
import LiveStudentView from "./LiveStudentView";

export default function LiveOrArchive({
  lectureId,
  canEdit = false,
}: {
  lectureId: string;
  canEdit?: boolean;
}) {
  const [lecture, setLecture] = useState<LiveLecture | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const off = subscribeLiveLecture(lectureId, (next) => {
      if (!active) return;
      setLecture(next);
      setLoaded(true);
    });
    return () => {
      active = false;
      off();
    };
  }, [lectureId]);

  if (!loaded) {
    return (
      <main className="min-h-[60vh] w-full">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
        </div>
      </main>
    );
  }

  if (lecture && lecture.status !== "ended") {
    return <LiveStudentView lectureId={lectureId} lecture={lecture} />;
  }

  return <ArchiveLectureView lectureId={lectureId} canEdit={canEdit} />;
}
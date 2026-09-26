import { NextRequest, NextResponse } from "next/server";
import { getLecturesByCourse, getLectureById } from "@/lib/mock-hemis";

interface StudentAnalytics {
  courseProgress: { courseId: string; progress: number; completedLectures: number; totalLectures: number }[];
  lectureCompletion: { lectureId: string; completed: boolean; progress: number }[];
  quizPerformance: { quizId: string; score: number; topic: string; weakTopics: string[] }[];
  attendance: { courseId: string; rate: number; total: number; present: number }[];
  recommendations: { id: string; type: string; title: string; message: string; priority: "high" | "medium" | "low" }[];
  upcomingLectures: { lectureId: string; title: string; date: string; courseId: string }[];
  recentActivity: { type: string; title: string; timestamp: string }[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const studentId = searchParams.get("studentId") || "student-1";

  // Get student's courses (from mock data)
  const studentCourses = [
    { id: "c1", name: "Искусственный Интеллект", code: "AI-401" },
    { id: "c2", name: "Экономика", code: "ECO-210" },
    { id: "c3", name: "Базы данных", code: "DB-310" },
  ];

  // Calculate course progress
  const courseProgress = studentCourses.map((course) => {
    const lectures = getLecturesByCourse(course.id);
    // Mock: student completed some lectures
    const completedLectures = Math.floor(lectures.length * 0.6);
    return {
      courseId: course.id,
      progress: Math.round((completedLectures / lectures.length) * 100),
      completedLectures,
      totalLectures: lectures.length,
    };
  });

  // Lecture completion details
  const allLectures = studentCourses.flatMap((c) => getLecturesByCourse(c.id));
  const lectureCompletion = allLectures.map((lecture) => ({
    lectureId: lecture.id,
    completed: Math.random() > 0.4,
    progress: Math.random() > 0.4 ? 100 : Math.floor(Math.random() * 80),
  }));

  // Quiz performance
  const quizPerformance = allLectures.map((lecture) => {
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const weakTopics = score < 80 ? [lecture.summary[0] || "General"] : [];
    return {
      quizId: `quiz-${lecture.id}`,
      score,
      topic: lecture.title,
      weakTopics,
    };
  });

  // Attendance
  const attendance = studentCourses.map((course) => ({
    courseId: course.id,
    rate: Math.floor(Math.random() * 20) + 80, // 80-100
    total: 10,
    present: Math.floor(Math.random() * 3) + 7,
  }));

  // Generate recommendations based on real data
  const recommendations: { id: string; type: string; title: string; message: string; priority: "high" | "medium" | "low" }[] = [];
  
  // Find weak quiz topics
  const weakQuizTopics = quizPerformance.filter((q) => q.score < 75);
  weakQuizTopics.forEach((q) => {
    recommendations.push({
      id: `rec-${q.quizId}`,
      type: "review_topic",
      title: "Review needed",
      message: `Your score on "${q.topic}" was ${q.score}%. Review this topic before the next lecture.`,
      priority: "high" as const,
    });
  });

  // Find incomplete lectures
  const incompleteLectures = lectureCompletion.filter((l) => !l.completed).slice(0, 2);
  incompleteLectures.forEach((l) => {
    const lecture = getLectureById(l.lectureId);
    if (lecture) {
      recommendations.push({
        id: `rec-complete-${l.lectureId}`,
        type: "complete_lecture",
        title: "Complete lecture",
        message: `Finish watching "${lecture.title}" (${l.progress}% complete).`,
        priority: "medium" as const,
      });
    }
  });

  // Upcoming lectures (next 2)
  const upcomingLectures = allLectures.slice(0, 2).map((lecture) => ({
    lectureId: lecture.id,
    title: lecture.title,
    date: lecture.date,
    courseId: lecture.courseId,
  }));

  // Recent activity
  const recentActivity = [
    { type: "lecture_viewed", title: "Viewed lecture: Price Elasticity", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { type: "quiz_completed", title: "Completed quiz: Neural Networks", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { type: "ai_question", title: "Asked AI: What is overfitting?", timestamp: new Date(Date.now() - 10800000).toISOString() },
  ];

  return NextResponse.json({
    analytics: {
      courseProgress,
      lectureCompletion,
      quizPerformance,
      attendance,
      recommendations,
      upcomingLectures,
      recentActivity,
    } as StudentAnalytics,
  });
}
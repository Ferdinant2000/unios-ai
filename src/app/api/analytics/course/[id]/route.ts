import { NextRequest, NextResponse } from "next/server";
import { getLectureById, getLecturesByCourse, COURSES } from "@/lib/mock-hemis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const course = COURSES.find((c) => c.id === courseId);

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const lectures = getLecturesByCourse(courseId);

  // Student analytics
  const students = [
    { id: "student-1", name: "Ahmed Karimov", attendance: 92, avgQuiz: 85 },
    { id: "student-2", name: "Malika Yusupova", attendance: 95, avgQuiz: 92 },
    { id: "student-3", name: "Jasur Rahimov", attendance: 88, avgQuiz: 78 },
  ];

  // Lecture analytics
  const lectureAnalytics = lectures.map((lecture) => ({
    lectureId: lecture.id,
    title: lecture.title,
    date: lecture.date,
    views: Math.floor(Math.random() * 50) + 20,
    avgWatchTime: Math.floor(Math.random() * 30) + 15,
    quizAvgScore: Math.floor(Math.random() * 30) + 70,
    questionsAsked: Math.floor(Math.random() * 10),
  }));

  // Confused topics (calculated from quiz performance and questions)
  const confusedTopics = [
    { topic: "Price Elasticity", difficulty: 72, studentsStruggling: 2 },
    { topic: "Cross-price Elasticity", difficulty: 65, studentsStruggling: 1 },
    { topic: "Income Elasticity", difficulty: 45, studentsStruggling: 0 },
  ];

  // Engagement over time
  const engagementTrend = [
    { date: "2024-09-15", engagement: 85 },
    { date: "2024-09-20", engagement: 92 },
    { date: "2024-09-25", engagement: 88 },
    { date: "2024-09-28", engagement: 90 },
  ];

  // Quiz performance by topic
  const quizPerformance = lectures.flatMap((lecture) => {
    const topics = lecture.summary;
    return topics.map((topic) => ({
      topic,
      avgScore: Math.floor(Math.random() * 40) + 60,
      attempts: Math.floor(Math.random() * 20) + 5,
    }));
  });

  return NextResponse.json({
    analytics: {
      course: {
        id: course.id,
        name: course.title,
        code: course.code,
        professor: course.professorName,
        totalStudents: students.length,
      },
      students,
      lectureAnalytics,
      confusedTopics,
      engagementTrend,
      quizPerformance,
      overallEngagement: Math.floor(
        lectureAnalytics.reduce((sum, l) => sum + l.quizAvgScore, 0) / lectureAnalytics.length
      ),
    },
  });
}
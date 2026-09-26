import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

const NOTIFICATION_STORE: Notification[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit = parseInt(searchParams.get("limit") || "50");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  let notifications = NOTIFICATION_STORE.filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (unreadOnly) {
    notifications = notifications.filter((n) => !n.read);
  }

  return NextResponse.json({ notifications: notifications.slice(0, limit) });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, type, title, message, actionUrl, actionLabel } = body as {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
  };

  if (!userId || !type || !title || !message) {
    return NextResponse.json(
      { error: "userId, type, title, and message are required" },
      { status: 400 }
    );
  }

  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl,
    actionLabel,
  };

  NOTIFICATION_STORE.unshift(notification);

  if (NOTIFICATION_STORE.length > 5000) {
    NOTIFICATION_STORE.pop();
  }

  return NextResponse.json({ notification });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { notificationId, userId, read } = body as {
    notificationId: string;
    userId: string;
    read: boolean;
  };

  const notification = NOTIFICATION_STORE.find(
    (n) => n.id === notificationId && n.userId === userId
  );

  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  notification.read = read;
  return NextResponse.json({ notification });
}
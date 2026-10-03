"use client";

import { useEffect, useState } from "react";
import { createClient } from "./utils/client";

export default function UnreadMessageBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadUnreadCount(userId: string) {
      const { count: unreadCount, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("direction", "incoming")
        .eq("status", "received")
        .is("read_at", null);

      if (error) {
        console.error(
          "Failed to load unread message count:",
          error
        );
        return;
      }

      if (!cancelled) {
        setCount(unreadCount ?? 0);
      }
    }

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      await loadUnreadCount(user.id);

      if (cancelled) {
        return;
      }

      channel = supabase
        .channel(`unread-messages-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadUnreadCount(user.id);
          }
        )
        .subscribe();
    }

    initialize();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <span className="ml-auto min-w-5 rounded-full bg-[#2563EB] px-1.5 py-0.5 text-center text-[10px] font-medium leading-4 text-white">
      {count}
    </span>
  );
}
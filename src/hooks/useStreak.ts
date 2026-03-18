import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    if (!user) return;
    fetchStreak();
  }, [user]);

  const fetchStreak = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setStreak({ current: data.current_streak, longest: data.longest_streak });
    }
  };

  // Call this when user completes an activity (quiz, chat, notes)
  const recordActivity = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      // First ever activity
      await supabase.from("streaks").insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
      setStreak({ current: 1, longest: 1 });
    } else {
      const lastDate = existing.last_activity_date;
      if (lastDate === today) return; // Already recorded today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (lastDate === yesterdayStr) {
        newStreak = existing.current_streak + 1;
      }

      const newLongest = Math.max(newStreak, existing.longest_streak);

      await supabase
        .from("streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
        })
        .eq("user_id", user.id);

      setStreak({ current: newStreak, longest: newLongest });
    }
  };

  return { streak, recordActivity };
};

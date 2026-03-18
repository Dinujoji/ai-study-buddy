// Helper to stream AI responses from the chat edge function

type Message = { role: "user" | "assistant"; content: string };

export async function streamChat({
  messages,
  mode = "chat",
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  mode?: "chat" | "summarize" | "quiz";
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, mode }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Request failed" }));
      onError?.(errorData.error || `Error: ${resp.status}`);
      onDone();
      return;
    }

    if (!resp.body) {
      onError?.("No response body");
      onDone();
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const { done: readerDone, value } = await reader.read();
      if (readerDone) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          done = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Flush remaining
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (err) {
    onError?.(err instanceof Error ? err.message : "Connection error");
    onDone();
  }
}

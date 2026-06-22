const API_BASE = window.location.origin;

async function sendMessageStream({
  message,
  history,
  onDelta,
  signal,
  sessionId,
}) {
  const body = { message, history };
  if (sessionId) body.session_id = sessionId;

  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body?.detail || "Erro ao enviar mensagem para o servidor.";
    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error("Streaming nao suportado no ambiente atual.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const rawEvent of events) {
      const line = rawEvent
        .split("\n")
        .find((part) => part.startsWith("data:"));
      if (!line) continue;

      const payloadText = line.slice(5).trim();
      if (!payloadText) continue;

      let payload;
      try {
        payload = JSON.parse(payloadText);
      } catch {
        continue;
      }

      if (payload.error) {
        throw new Error(payload.error);
      }

      if (payload.delta) {
        onDelta(payload.delta);
      }
    }
  }
}

/* ── Session API ────────────────────────────────────────────── */

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.detail || `Erro ${response.status}`);
  }
  return response;
}

async function listSessions() {
  const resp = await apiFetch(`${API_BASE}/api/sessions`);
  const data = await resp.json();
  return data.sessions;
}

async function createSession() {
  const resp = await apiFetch(`${API_BASE}/api/sessions`, { method: "POST" });
  return await resp.json();
}

async function getSessionMessages(sessionId) {
  const resp = await apiFetch(`${API_BASE}/api/sessions/${sessionId}/messages`);
  return await resp.json();
}

async function deleteSession(sessionId) {
  await apiFetch(`${API_BASE}/api/sessions/${sessionId}`, { method: "DELETE" });
}

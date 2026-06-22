const { useEffect, useMemo, useRef, useState, useCallback } = React;

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesRef = useRef(null);
  const abortControllerRef = useRef(null);
  const initialLoadDone = useRef(false);

  const WELCOME_MESSAGE = {
    id: createMessageId(),
    role: "assistant",
    content: "Bem-vindo ao ChatLLM Lab. Como posso ajudar voce hoje?",
  };

  // Load sessions on mount and create first if none exist
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    (async () => {
      try {
        let allSessions = await listSessions();
        if (allSessions.length === 0) {
          const newSession = await createSession();
          allSessions = [newSession];
        }
        setSessions(allSessions);
        // Select the first session
        const target = allSessions[0];
        setCurrentSessionId(target.id);
        // Load messages for that session
        const msgsData = await getSessionMessages(target.id);
        const loaded = msgsData.messages.map((m) => ({
          id: createMessageId(),
          role: m.role,
          content: m.content,
        }));
        setMessages(loaded.length > 0 ? loaded : [WELCOME_MESSAGE]);
      } catch (err) {
        console.error("Failed to load sessions:", err);
        setMessages([WELCOME_MESSAGE]);
      }
    })();
  }, []);

  const chatHistory = useMemo(
    () =>
      messages.filter((msg) => msg.role === "user" || msg.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const all = await listSessions();
      setSessions(all);
    } catch {
      // ignore
    }
  }, []);

  const switchSession = useCallback(
    async (sessionId) => {
      if (busy) abortControllerRef.current?.abort();
      setCurrentSessionId(sessionId);
      setError("");
      try {
        const msgsData = await getSessionMessages(sessionId);
        const loaded = msgsData.messages.map((m) => ({
          id: createMessageId(),
          role: m.role,
          content: m.content,
        }));
        setMessages(loaded.length > 0 ? loaded : [WELCOME_MESSAGE]);
      } catch {
        setMessages([WELCOME_MESSAGE]);
      }
    },
    [busy],
  );

  const handleNewSession = useCallback(async () => {
    if (busy) abortControllerRef.current?.abort();
    try {
      const newSession = await createSession();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([WELCOME_MESSAGE]);
      setError("");
    } catch (err) {
      setError("Erro ao criar nova sessao.");
    }
  }, [busy]);

  const handleDeleteSession = useCallback(
    async (sessionId, e) => {
      e.stopPropagation();
      if (sessions.length <= 1) {
        setError("Nao e possivel excluir a unica sessao.");
        return;
      }
      try {
        await deleteSession(sessionId);
        const remaining = sessions.filter((s) => s.id !== sessionId);
        setSessions(remaining);
        if (currentSessionId === sessionId) {
          const target = remaining[0];
          setCurrentSessionId(target.id);
          switchSession(target.id);
        }
      } catch {
        setError("Erro ao excluir sessao.");
      }
    },
    [sessions, currentSessionId, switchSession],
  );

  const onStop = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setBusy(false);
  };

  const onSubmit = async (event, inputRef) => {
    event.preventDefault();
    const cleaned = text.trim();
    if (!cleaned || busy) return;

    setError("");
    const userMessage = {
      id: createMessageId(),
      role: "user",
      content: cleaned,
    };
    const assistantMessageId = createMessageId();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);
    setText("");
    setBusy(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const wasNewSession =
      messages.length === 1 && messages[0].id === WELCOME_MESSAGE.id;

    try {
      await sendMessageStream({
        message: cleaned,
        history: wasNewSession ? [] : chatHistory,
        signal: abortController.signal,
        onDelta: (delta) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: `${msg.content}${delta}` }
                : msg,
            ),
          );
        },
        sessionId: currentSessionId,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId && !msg.content.trim()
            ? {
                ...msg,
                content: "Nao foi possivel obter resposta do modelo agora.",
              }
            : msg,
        ),
      );

      // Refresh sessions to get auto-generated title
      await refreshSessions();
    } catch (err) {
      const aborted = err?.name === "AbortError";
      if (!aborted) {
        setError(err.message || "Falha inesperada ao gerar resposta.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: msg.content.trim()
                    ? msg.content
                    : "Nao foi possivel obter resposta do modelo agora.",
                }
              : msg,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId && !msg.content.trim()
              ? { ...msg, content: "Resposta interrompida." }
              : msg,
          ),
        );
      }
    } finally {
      abortControllerRef.current = null;
      setBusy(false);
    }
  };

  const currentTitle = currentSessionId
    ? sessions.find((s) => s.id === currentSessionId)?.title || "Nova conversa"
    : "ChatLLM Lab";

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-new-btn"
            onClick={handleNewSession}
            title="Nova conversa"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="8" y1="3" x2="8" y2="13" />
              <line x1="3" y1="8" x2="13" y2="8" />
            </svg>
            Nova conversa
          </button>
        </div>
        <nav className="sidebar-list">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`sidebar-item ${s.id === currentSessionId ? "active" : ""}`}
              onClick={() => switchSession(s.id)}
            >
              <span
                className="sidebar-item-title"
                title={s.title || "Nova conversa"}
              >
                {s.title || "Nova conversa"}
              </span>
              <button
                className="sidebar-item-del"
                onClick={(e) => handleDeleteSession(s.id, e)}
                title="Excluir sessao"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="3" x2="9" y2="9" />
                  <line x1="9" y1="3" x2="3" y2="9" />
                </svg>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <main className="app-shell">
        <header className="app-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            title="Alternar sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="4" x2="15" y2="4" />
              <line x1="3" y1="9" x2="15" y2="9" />
              <line x1="3" y1="14" x2="15" y2="14" />
            </svg>
          </button>
          <div className="brand">{currentTitle}</div>
        </header>

        <section className="messages" aria-live="polite" ref={messagesRef}>
          <div className="messages-inner">
            {messages.map((msg) => (
              <article key={msg.id} className={`bubble ${msg.role}`}>
                <MessageContent content={msg.content} />
              </article>
            ))}
          </div>
        </section>

        <Composer
          text={text}
          busy={busy}
          error={error}
          onChangeText={setText}
          onSubmit={onSubmit}
          onStop={onStop}
        />

        <div className="warning-banner">
          Lembre-se, voce precisa focar no experimento!!!
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

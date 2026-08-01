import React, { useCallback, useEffect, useRef, useState } from "react";
import path from "node:path";
import { Box, useApp, useInput } from "ink";
import { AIClient, type ChatMessage } from "../../ai/client.js";
import { MODELS, resolveModel } from "../../ai/models.js";
import { appendHistory } from "../../utils/history.js";
import type { ThemeName } from "../colors.js";
import { ThemeContext, PALETTES, THEME_ORDER, resolvePalette } from "./theme.js";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";
import { MessageList } from "./MessageList.js";
import { InputBox } from "./InputBox.js";
import { Spinner } from "./Spinner.js";
import { CommandPalette, type PaletteSection } from "./CommandPalette.js";
import { HelpOverlay } from "./HelpOverlay.js";
import { useTerminalSize } from "./useTerminalSize.js";
import { useElapsedTime } from "./useElapsedTime.js";
import { nextMessageId, type UIMessage } from "./types.js";

export interface ChatAppProps {
  apiKey: string | undefined;
  model: string;
  modelLabel: string;
  theme?: string;
}

const PROJECT_NAME = "ISTIAK CLI";
const HEADER_ROWS = 3;
const FOOTER_ROWS = 1;
const INPUT_ROWS = 4; // bordered input (3 rows) + model/char-count meta row (1 row)
const STATUS_ROWS = 1;

export function ChatApp({
  apiKey,
  model: initialModel,
  modelLabel: initialModelLabel,
  theme: initialTheme,
}: ChatAppProps): React.JSX.Element {
  const { exit } = useApp();
  const { columns, rows } = useTerminalSize();
  const sessionStartedAt = useRef(Date.now()).current;
  const sessionTime = useElapsedTime(sessionStartedAt);
  const cwd = path.basename(process.cwd()) || process.cwd();

  const [themeName, setThemeName] = useState<ThemeName>(resolvePalette(initialTheme).name);
  const palette = PALETTES[themeName];

  const [modelId, setModelId] = useState(initialModel);
  const [modelLabel, setModelLabel] = useState(initialModelLabel);

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const messagesRef = useRef<UIMessage[]>(messages);
  const isStreamingRef = useRef(isStreaming);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const clientRef = useRef<AIClient | null>(null);
  if (!clientRef.current) {
    try {
      clientRef.current = new AIClient(apiKey, initialModel);
    } catch {
      // Surfaced when the user actually sends a message, below.
    }
  }
  const connected = clientRef.current !== null;

  const clearConversation = useCallback(() => {
    setMessages([]);
    setScrollOffset(0);
    setErrorText(null);
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      abortControllerRef.current?.abort();
      exit();
      return;
    }
    if (key.ctrl && input === "l") {
      clearConversation();
      return;
    }
    if (key.ctrl && input === "p") {
      setHelpOpen(false);
      setPaletteOpen((open) => !open);
      return;
    }
    if (key.pageUp) {
      setScrollOffset((offset) =>
        Math.min(offset + 3, Math.max(messagesRef.current.length - 1, 0))
      );
      return;
    }
    if (key.pageDown) {
      setScrollOffset((offset) => Math.max(offset - 3, 0));
    }
  });

  const paletteSections: PaletteSection[] = [
    {
      title: "Commands",
      items: [
        { id: "cmd:clear", label: "Clear conversation" },
        { id: "cmd:help", label: "Show help" },
      ],
    },
    {
      title: "Theme",
      items: THEME_ORDER.map((name) => ({
        id: `theme:${name}`,
        label: name,
        description: name === themeName ? "current" : undefined,
      })),
    },
    {
      title: "Model",
      items: MODELS.map((m) => ({
        id: `model:${m.id}`,
        label: m.label,
        description: m.id === modelId ? "current" : undefined,
      })),
    },
  ];

  const handlePaletteSelect = useCallback(
    (id: string) => {
      setPaletteOpen(false);

      if (id === "cmd:clear") {
        clearConversation();
        return;
      }
      if (id === "cmd:help") {
        setHelpOpen(true);
        return;
      }
      if (id.startsWith("theme:")) {
        const name = id.slice("theme:".length);
        if (name in PALETTES) setThemeName(name as ThemeName);
        return;
      }
      if (id.startsWith("model:")) {
        const nextId = id.slice("model:".length);
        const resolved = resolveModel(nextId);
        if (resolved) {
          clientRef.current?.setModel(resolved.id);
          setModelId(resolved.id);
          setModelLabel(resolved.label);
        }
      }
    },
    [clearConversation]
  );

  const handleSubmit = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || isStreamingRef.current) return;

    setInputHistory((h) => [...h, raw]);
    setScrollOffset(0);
    setErrorText(null);

    const userMessage: UIMessage = {
      id: nextMessageId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    const assistantMessage: UIMessage = {
      id: nextMessageId(),
      role: "assistant",
      content: "",
      streaming: true,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    void appendHistory({ role: "user", content: text });

    const client = clientRef.current;
    if (!client) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                streaming: false,
                error: true,
                content: "Missing OPENROUTER_API_KEY. Run `istiak config set` to configure it.",
              }
            : m
        )
      );
      return;
    }

    setIsStreaming(true);

    const history: ChatMessage[] = messagesRef.current
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: text });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let full = "";
    client
      .stream(
        history,
        (chunk) => {
          full += chunk;
          if (!isMountedRef.current) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: full } : m))
          );
        },
        controller.signal
      )
      .then(() => {
        if (!isMountedRef.current) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, streaming: false, content: full } : m
          )
        );
        void appendHistory({ role: "assistant", content: full });
      })
      .catch((err: Error) => {
        if (controller.signal.aborted || !isMountedRef.current) return;

        setErrorText(err.message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, streaming: false, error: true, content: full || err.message }
              : m
          )
        );
      })
      .finally(() => {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        if (isMountedRef.current) setIsStreaming(false);
      });
  }, []);

  const chromeRows = HEADER_ROWS + FOOTER_ROWS + INPUT_ROWS + STATUS_ROWS;
  const availableRows = Math.max(rows - chromeRows, 3);
  const overlayOpen = paletteOpen || helpOpen;

  return (
    <ThemeContext.Provider value={palette}>
      <Box flexDirection="column" width={columns}>
        <Header
          projectName={PROJECT_NAME}
          modelLabel={modelLabel}
          connected={connected}
          cwd={cwd}
          sessionTime={sessionTime}
          columns={columns}
        />
        <Box flexDirection="column" width={columns} minHeight={availableRows}>
          {paletteOpen ? (
            <CommandPalette
              sections={paletteSections}
              columns={columns}
              onSelect={handlePaletteSelect}
              onClose={() => setPaletteOpen(false)}
            />
          ) : helpOpen ? (
            <HelpOverlay columns={columns} onClose={() => setHelpOpen(false)} />
          ) : (
            <MessageList
              messages={messages}
              columns={columns}
              availableRows={availableRows}
              scrollOffset={scrollOffset}
              modelLabel={modelLabel}
            />
          )}
        </Box>
        <Box height={STATUS_ROWS} paddingX={1}>
          {isStreaming ? <Spinner label="thinking…" /> : null}
        </Box>
        <InputBox
          columns={columns}
          disabled={isStreaming || overlayOpen}
          history={inputHistory}
          modelLabel={modelLabel}
          onSubmit={handleSubmit}
        />
        <Footer columns={columns} status={errorText ?? undefined} isError={Boolean(errorText)} />
      </Box>
    </ThemeContext.Provider>
  );
}

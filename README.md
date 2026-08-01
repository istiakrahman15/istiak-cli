# ISTIAK CLI

> AI-powered developer terminal — chat, generate, debug, and ship without leaving the command line.

## Features

- 🤖 AI chat, code generation, debugging, and code review
- ⚡ Streaming responses via OpenRouter (DeepSeek, GPT, Claude, Gemini, Qwen, Llama)
- 🎨 Beautiful terminal UI (Ink + Chalk + Boxen)
- 🧠 Session memory & chat history
- 📁 File read/write and folder analysis
- 🎯 Git helper, project scaffolding, doc/test generation
- 🎭 Themes: Dark, Light, Cyber, Matrix

## Install

```bash
npm install -g istiak-cli
```

## Chat UI

`istiak chat` opens a full-screen, keyboard-first chat interface built with
[Ink](https://github.com/vadimdemedes/ink) (React for the terminal):

- Streaming responses with a live blinking cursor, rendered token-by-token
- Markdown + syntax-highlighted code blocks once a reply finishes streaming
- Multiline input (`Alt+Enter` for a newline, `Enter` to send), with a
  model indicator and character count
- Message history recall with `↑` / `↓`
- Scrollable transcript with `PageUp` / `PageDown`
- `Ctrl+L` clears the conversation, `Ctrl+C` exits
- `Ctrl+P` opens a command palette — clear the chat, switch theme, or
  switch model on the fly, without leaving the conversation
- A status bar showing the live model, theme, connection status, current
  directory, and session time (fields adapt to terminal width)
- A welcome screen with example prompts on first launch, and a categorized
  in-app help screen (from the command palette)
- Responsive layout that adapts to terminal width and resizes live

Switching theme or model from the command palette applies immediately for
the session; `istiak config set` changes the persisted default for future
sessions. Themes: `dark`, `cyber`, `matrix`, `light`.

## Setup

```bash
istiak config
# or manually:
cp .env.example .env
# then add your OPENROUTER_API_KEY
```

## Usage

```bash
istiak ask "how do I center a div?"
istiak chat
istiak code "a debounce function in TypeScript"
istiak code "a debounce function" --copy   # copy result to clipboard
istiak code "a debounce function" --out debounce.ts
istiak fix ./src/index.ts
istiak explain ./src/utils/logger.ts
istiak review .
istiak commit
istiak doc
istiak test ./src/utils/files.ts
istiak optimize ./src/index.ts
istiak refactor ./src/index.ts
istiak git status
istiak create react my-app
istiak search "node fs promises"
istiak doctor
istiak model
istiak update
istiak config
```

## Commands

| Command | Description |
|---|---|
| `ask` | One-shot AI question |
| `chat` | Interactive AI chat session |
| `code` | Generate code from a prompt |
| `fix` | Fix errors in a file |
| `explain` | Explain what code does |
| `review` | Review a project or file |
| `commit` | Generate a git commit message |
| `doc` | Generate documentation |
| `test` | Generate tests |
| `optimize` | Optimize code |
| `refactor` | Refactor code |
| `git` | Git helper utilities |
| `create` | Scaffold a new project |
| `search` | Search documentation |
| `doctor` | Check environment (Node, Git, npm) |
| `model` | Switch AI model |
| `update` | Update the CLI |
| `config` | Manage settings |

## Configuration

Set these in `.env` (see `.env.example`):

```env
OPENROUTER_API_KEY=
MODEL=deepseek/deepseek-chat
```

## Development

```bash
npm install       # also sets up the pre-commit hook (lint-staged)
npm run dev        # run the CLI from source (tsx)
npm run lint        # eslint
npm run typecheck    # tsc --noEmit
npm run format:check  # prettier --check
npm test              # vitest
npm run build          # tsc -p tsconfig.build.json -> dist/
```

CI runs lint, format check, typecheck, tests, and build on every push/PR
(see `.github/workflows/ci.yml`). A pre-commit hook (Husky + lint-staged)
runs ESLint and Prettier on staged files before each commit.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

## License

MIT © Istiak Rahman

<div align="center">

```
   ___ ____ _____ ___    _    _  __
  |_ _/ ___|_   _|_ _|  / \  | |/ /
   | |\___ \ | |  | |  / _ \ | ' /
   | | ___) || |  | | / ___ \| . \
  |___|____/ |_| |___/_/   \_\_|\_\
                                CLI
```

# ISTIAK CLI

**The AI-powered developer terminal for modern workflows.**

ISTIAK CLI brings AI chat, code generation, debugging, project scaffolding, and
Git workflows into a single, fast, keyboard-first terminal tool — no browser
tab required.

[![npm version](https://img.shields.io/npm/v/istiak-cli.svg)](https://www.npmjs.com/package/istiak-cli)
[![npm downloads](https://img.shields.io/npm/dm/istiak-cli.svg)](https://www.npmjs.com/package/istiak-cli)
[![GitHub stars](https://img.shields.io/github/stars/istiakrahman15/istiak-cli.svg?style=social)](https://github.com/istiakrahman15/istiak-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6.svg)](https://www.typescriptlang.org)

[Install](#-installation) · [Quick Start](#-30-second-quick-start) · [Commands](#commands) · [Configuration](#configuration) · [Contributing](#contributing)

</div>

---

## Overview

ISTIAK CLI is a terminal-native AI assistant built for the parts of
development that usually mean switching to a browser: asking a quick
question, generating a function, reviewing a diff, writing a commit message,
or scaffolding a new project. It routes every request through
[OpenRouter](https://openrouter.ai), so you pick the model — DeepSeek, GPT,
Claude, Gemini, Qwen, or Llama — without changing how you work.

The core of the tool is `istiak chat`, a full-screen interactive session
built with [Ink](https://github.com/vadimdemedes/ink) (React for the
terminal): streaming responses, syntax-highlighted markdown, a command
palette, and a scrollable transcript, all rendered directly in your shell.
Everything else — `fix`, `review`, `commit`, `create`, and the rest — is a
single command you can drop into a script or run one-off.

ISTIAK CLI is written in strict TypeScript, ships as pure ESM, and has no
runtime dependency on a specific model provider beyond OpenRouter's API.

---

## Features

| | |
|---|---|
| ✓ **AI Chat** | Full-screen interactive session with streaming responses and message history |
| ✓ **Code Generation** | Generate code from a prompt, save to a file, or copy straight to your clipboard |
| ✓ **Code Review** | Summarized, file-by-file review of a project or a single file |
| ✓ **Bug Fixing** | Point it at a file and get a diagnosis plus a corrected version |
| ✓ **Documentation** | Generate Markdown docs for a file, printed or saved |
| ✓ **Git Helpers** | Status summaries, commit message generation, safe undo, branch cleanup |
| ✓ **Project Scaffolding** | Bootstrap React, Vue, Node, Express, or Next projects |
| ✓ **Streaming Responses** | Token-by-token output, no waiting on a spinner for long replies |
| ✓ **Multiple AI Models** | DeepSeek, GPT, Claude, Gemini, Qwen, and Llama via OpenRouter |
| ✓ **Themes** | Dark, Light, Cyber, and Matrix — switchable live from the command palette |
| ✓ **Cross Platform** | Windows (CMD, PowerShell, Windows Terminal), macOS, and Linux |
| ✓ **Markdown Rendering** | Syntax-highlighted code blocks and formatted output in every command |

---

## 📦 Installation

**Requirements**

- Node.js 22 or later
- npm
- An [OpenRouter](https://openrouter.ai/keys) API key

**Install globally**

```bash
npm install -g istiak-cli
```

**Verify installation**

```bash
istiak --version
istiak --help
```

---

## ⚡ 30-Second Quick Start

```bash
# Install
npm install -g istiak-cli

# Configure your API key, default model, and theme
istiak config set

# Launch the interactive chat UI
istiak

# Or ask a one-shot question without leaving your current command
istiak ask "Build a responsive React navbar"

# Or open the full chat session directly
istiak chat
```

---

## Commands

| Command | Description | Example |
|---|---|---|
| `ask` | One-shot AI question, streamed to stdout | `istiak ask "how do I center a div?"` |
| `chat` | Full-screen interactive AI chat session | `istiak chat` |
| `code` | Generate code from a prompt | `istiak code "a debounce function" --copy` |
| `fix` | Diagnose and fix errors in a file | `istiak fix src/index.ts` |
| `review` | Review a project or a single file | `istiak review .` |
| `explain` | Explain what a piece of code does | `istiak explain src/utils/logger.ts` |
| `commit` | Generate a commit message from staged changes | `istiak commit --apply` |
| `doc` | Generate documentation for a file | `istiak doc src/index.ts` |
| `test` | Generate unit tests for a file | `istiak test src/utils/files.ts` |
| `optimize` | Suggest performance optimizations | `istiak optimize src/index.ts` |
| `refactor` | Refactor a file for clarity | `istiak refactor src/index.ts --apply` |
| `git` | Git helper utilities (`status`, `undo`, `clean-branches`) | `istiak git status` |
| `create` | Scaffold a new project | `istiak create react my-app` |
| `search` | Search developer documentation | `istiak search "node fs promises"` |
| `doctor` | Check your environment (Node, npm, Git, API key) | `istiak doctor` |
| `model` | List or switch the active AI model | `istiak model claude` |
| `update` | Update the CLI to the latest version | `istiak update` |
| `config` | Manage settings (`set`, `show`) | `istiak config set` |

Run `istiak <command> --help` for a command's full option list.

---

## Supported AI Models

| Model | Provider |
|---|---|
| **DeepSeek** *(default)* | `deepseek/deepseek-chat` |
| **GPT** | `openai/gpt-4o-mini` |
| **Claude** | `anthropic/claude-3.5-sonnet` |
| **Gemini** | `google/gemini-pro-1.5` |
| **Qwen** | `qwen/qwen-2.5-72b-instruct` |
| **Llama** | `meta-llama/llama-3.1-70b-instruct` |

Switch the default with `istiak model <name>`, or change it live for the
current session from the chat command palette (`Ctrl+P`).

---

## Configuration

ISTIAK CLI reads configuration in this order — environment variables first,
then the persisted config file, then built-in defaults:

| Setting | Environment variable | Config key |
|---|---|---|
| API key | `OPENROUTER_API_KEY` | `OPENROUTER_API_KEY` |
| Model | `MODEL` | `MODEL` |
| Theme | — | `theme` |

Run the interactive setup:

```bash
istiak config set
```

or check what's currently configured:

```bash
istiak config show
```

**Config file location**: `~/.istiak/config.json`, created with owner-only
(`0600`) permissions since it can hold a plaintext API key. Chat history is
stored separately at `~/.istiak-history.json`, also owner-only.

---

## Themes

| Theme | |
|---|---|
| `dark` | High-contrast cyan/magenta, default |
| `cyber` | Neon cyan/magenta on near-black |
| `matrix` | Green-on-black, minimal |
| `light` | Light-background terminals |

Set a default with `istiak config set`, or switch live during a chat session
via the command palette (`Ctrl+P`).

---

## Examples

```bash
istiak ask "explain the difference between let and const"
istiak code "a React dashboard layout" --out Dashboard.tsx
istiak review .
istiak fix src/app.ts
istiak test src/utils/parser.ts
istiak search "explain this regex: ^(?=.*[A-Z]).{8,}$"
istiak doc src/api/client.ts
```

---

## Development

```bash
git clone https://github.com/istiakrahman15/istiak-cli.git
cd istiak-cli

npm install          # also sets up the pre-commit hook (lint-staged)
npm run dev           # run the CLI from source (tsx), e.g. npm run dev -- chat
npm run build           # compile to dist/
npm run lint              # eslint
npm run typecheck          # tsc --noEmit
npm test                    # vitest
```

For local end-to-end testing of the packaged binary:

```bash
npm run build
npm link
istiak --version
```

CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, test, and
build on every push and pull request.

---

## Folder Structure

```
istiak-cli/
├── src/
│   ├── index.ts          # CLI entry point (shebang, top-level error handling)
│   ├── cli.ts             # Commander setup, command registration, --version/--help
│   ├── ai/                # OpenRouter client, streaming, model registry
│   ├── commands/          # One file per command (ask, chat, fix, review, ...)
│   ├── ui/
│   │   ├── ink/           # The `chat` UI — App, Header, InputBox, CommandPalette, ...
│   │   ├── banner.ts       # Static banner shown on `istiak` with no args
│   │   └── markdown.ts      # Markdown → ANSI rendering, used outside the chat UI
│   ├── utils/              # File I/O, history persistence, config-aware AI client
│   └── types/                # Ambient type declarations for untyped dependencies
├── scripts/                    # Build-time-only scripts (not published)
├── docs/                        # Roadmap and supplementary docs
├── dist/                         # Compiled output (git-ignored, published to npm)
└── .github/workflows/ci.yml       # Lint, typecheck, test, build on every push/PR
```

---

## Roadmap

**v1.0** — Terminal UI, AI chat, OpenRouter integration, streaming, config
system.

**v1.1** — Git helper, project generator, code review, error fixer, the Ink
chat UI (streaming, markdown, scrollback, command palette, themes), and the
full lint/typecheck/test/build/CI pipeline.

**v1.2** — Plugin system, additional file-analysis commands.

**v2.0** — Local model support, prebuilt platform binaries, a VS Code
extension, team collaboration features.

**Future ideas** — voice input, a Docker helper, deeper GitHub integration,
an SSH helper, a deployment assistant.

---

## FAQ

**Do I need an OpenRouter account?**
Yes — every AI command routes through [OpenRouter](https://openrouter.ai),
which gives you access to DeepSeek, GPT, Claude, Gemini, Qwen, and Llama
through a single API key.

**Which platforms are supported?**
Windows (CMD, PowerShell, and Windows Terminal), macOS, and Linux, with
Node.js 22 or later.

**Is my API key stored securely?**
It's stored in plaintext at `~/.istiak/config.json` with owner-only (`0600`)
file permissions and a `0700` directory — nothing else on a shared machine
can read it. It's never transmitted anywhere except directly to OpenRouter.

**Can I use environment variables instead of the config file?**
Yes — `OPENROUTER_API_KEY` and `MODEL` environment variables always take
priority over the saved config.

**Is my chat history stored anywhere?**
Yes, locally at `~/.istiak-history.json`, also owner-only. It never leaves
your machine except as conversation context sent to the model you're using.

**How do I switch models without editing config?**
Run `istiak model <name>` to change the default, or press `Ctrl+P` inside
`istiak chat` to switch for the current session only.

**Does `istiak fix` or `refactor` overwrite my files automatically?**
Only with `--apply` (or `--out <file>` for commands that support writing to
a new file). Without it, output prints to the terminal and nothing on disk
changes.

**Can I use ISTIAK CLI in a CI pipeline?**
Yes — every command works non-interactively except `chat` and `config set`,
which require a TTY.

**How do I update to the latest version?**
Run `istiak update`, or `npm install -g istiak-cli@latest`.

**What happens if a project-scan command hits a file it can't read?**
Commands like `review` skip unreadable files (broken symlinks, permission
errors) and report which ones were skipped, rather than failing outright.

---

## Contributing

Contributions are welcome — bug reports, feature requests, and pull requests
alike.

1. Fork the repo and create a branch from `main`.
2. Run `npm install` to set up dependencies and the pre-commit hook.
3. Make your change, with tests where it makes sense (`npm test`).
4. Confirm `npm run lint`, `npm run typecheck`, and `npm run build` all pass.
5. Open a pull request describing what changed and why.

For anything nontrivial, open an issue first so we can talk through the
approach before you invest the time.

---

## License

[MIT](LICENSE)

---

## Author

**Istiak Rahman**

- GitHub — [github.com/istiakrahman15](https://github.com/istiakrahman15)
- npm — [npmjs.com/package/istiak-cli](https://www.npmjs.com/package/istiak-cli)

---

<div align="center">

If you find this project useful, consider giving it a ⭐ on GitHub.

</div>

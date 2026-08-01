import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { printBanner } from "./ui/banner.js";
import { registerAsk } from "./commands/ask.js";
import { registerChat } from "./commands/chat.js";
import { registerCode } from "./commands/code.js";
import { registerFix } from "./commands/fix.js";
import { registerExplain } from "./commands/explain.js";
import { registerReview } from "./commands/review.js";
import { registerCommit } from "./commands/commit.js";
import { registerDoc } from "./commands/doc.js";
import { registerTest } from "./commands/test.js";
import { registerOptimize } from "./commands/optimize.js";
import { registerRefactor } from "./commands/refactor.js";
import { registerGit } from "./commands/git.js";
import { registerCreate } from "./commands/create.js";
import { registerSearch } from "./commands/search.js";
import { registerDoctor } from "./commands/doctor.js";
import { registerModel } from "./commands/model.js";
import { registerUpdate } from "./commands/update.js";
import { registerConfig } from "./commands/config.js";

// Resolved at runtime relative to this file's own location, so it works
// identically whether running from source (src/cli.ts via tsx, one level
// below the project root) or from the compiled, globally-installed package
// (dist/cli.js, also one level below its package root) — both cases find
// the real package.json next to them, no build-time copying required.
const packageJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json");
const { version } = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string };

export async function run(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .name("istiak")
    .description("ISTIAK CLI — AI Developer Terminal")
    .version(version);

  // AI commands
  registerAsk(program);
  registerChat(program);
  registerCode(program);
  registerFix(program);
  registerExplain(program);
  registerReview(program);
  registerCommit(program);
  registerDoc(program);
  registerTest(program);
  registerOptimize(program);
  registerRefactor(program);

  // Developer commands
  registerGit(program);
  registerCreate(program);
  registerSearch(program);
  registerDoctor(program);
  registerModel(program);
  registerUpdate(program);
  registerConfig(program);

  if (argv.length <= 2) {
    printBanner();
    program.outputHelp();
    return;
  }

  await program.parseAsync(argv);
}

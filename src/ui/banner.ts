import boxen from "boxen";
import { colors } from "./colors.js";

const LOGO = `
██╗███████╗████████╗██╗ █████╗ ██╗  ██╗
██║██╔════╝╚══██╔══╝██║██╔══██╗██║ ██╔╝
██║███████╗   ██║   ██║███████║█████╔╝
██║╚════██║   ██║   ██║██╔══██║██╔═██╗
██║███████║   ██║   ██║██║  ██║██║  ██╗
╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
`;

export function printBanner(): void {
  const content =
    colors.primary(LOGO.trimEnd()) +
    "\n\n" +
    colors.bold("ISTIAK CLI") +
    colors.muted("  —  AI Developer Terminal") +
    "\n" +
    colors.muted("Ask anything... try `istiak ask \"...\"` or `istiak chat`");

  console.log(
    boxen(content, {
      padding: 1,
      margin: 1,
      borderColor: "cyan",
      borderStyle: "round",
    })
  );
}

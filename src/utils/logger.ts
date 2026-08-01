import { colors } from "../ui/colors.js";

export const logger = {
  info: (msg: string) => console.log(colors.primary("ℹ"), msg),
  success: (msg: string) => console.log(colors.success("✔"), msg),
  warn: (msg: string) => console.log(colors.warning("⚠"), msg),
  error: (msg: string) => console.error(colors.danger("✖"), msg),
  debug: (msg: string) => {
    if (process.env.DEBUG) console.log(colors.muted("• " + msg));
  },
};

import ora, { type Ora } from "ora";

export function startSpinner(text: string): Ora {
  return ora({ text, color: "cyan" }).start();
}

export function stopSpinnerSuccess(spinner: Ora, text?: string): void {
  spinner.succeed(text);
}

export function stopSpinnerFail(spinner: Ora, text?: string): void {
  spinner.fail(text);
}

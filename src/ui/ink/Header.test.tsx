import { describe, expect, it } from "vitest";
import { render } from "ink-testing-library";
import { ThemeContext, PALETTES } from "./theme.js";
import { Header } from "./Header.js";

const baseProps = {
  projectName: "ISTIAK CLI",
  modelLabel: "DeepSeek",
  connected: true,
  cwd: "istiak-cli",
  sessionTime: "1:23",
};

describe("Header", () => {
  it("renders the model label and project name on a wide terminal", () => {
    const { lastFrame } = render(
      <ThemeContext.Provider value={PALETTES.dark}>
        <Header {...baseProps} columns={120} />
      </ThemeContext.Provider>
    );

    const frame = lastFrame();
    expect(frame).toContain("DeepSeek");
    expect(frame).toContain("ISTIAK CLI");
    expect(frame).toContain("istiak-cli");
    expect(frame).toContain("1:23");
  });

  it("shows a disconnected indicator with no API key", () => {
    const { lastFrame } = render(
      <ThemeContext.Provider value={PALETTES.dark}>
        <Header {...baseProps} connected={false} columns={120} />
      </ThemeContext.Provider>
    );

    expect(lastFrame()).toContain("no API key");
  });

  it("drops to a compact title-only layout on a narrow terminal", () => {
    const { lastFrame } = render(
      <ThemeContext.Provider value={PALETTES.dark}>
        <Header {...baseProps} columns={40} />
      </ThemeContext.Provider>
    );

    const frame = lastFrame();
    expect(frame).toContain("ISTIAK");
    expect(frame).not.toContain("ISTIAK CLI");
    expect(frame).not.toContain("chat");
  });
});

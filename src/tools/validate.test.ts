import { describe, it, expect } from "vitest";
import { validateArgs } from "./validate.js";

describe("validateArgs", () => {
  it("passes for valid input", () => {
    const err = validateArgs(
      { action: "get", id: "1" },
      { properties: { action: { type: "string", enum: ["get", "list"] }, id: { type: "string" } }, required: ["action"] },
    );
    expect(err).toBeNull();
  });

  it("returns error message for missing required action", () => {
    const err = validateArgs({}, { properties: { action: { type: "string" } }, required: ["action"] });
    expect(err).toMatch(/Validation failed/);
    expect(err).toMatch(/action/);
  });

  it("rejects enum mismatch", () => {
    const err = validateArgs(
      { action: "boom" },
      { properties: { action: { type: "string", enum: ["get"] } }, required: ["action"] },
    );
    expect(err).toMatch(/action/);
  });
});
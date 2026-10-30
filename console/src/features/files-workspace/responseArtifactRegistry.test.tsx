// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  setResponseArtifactGroup,
  useResponseArtifacts,
  type ResponseArtifactScope,
} from "./responseArtifactRegistry";

const scope: ResponseArtifactScope = {
  kind: "session",
  agentId: "registry-agent",
  sessionId: "registry-session",
};

function Shelf() {
  const artifacts = useResponseArtifacts(scope);
  return (
    <output>
      {artifacts
        .map((target) => `${target.source}:${target.root}:${target.path}`)
        .join("|")}
    </output>
  );
}

describe("response artifact registry", () => {
  it("keeps same-named artifacts from distinct roots and sources", () => {
    const release = setResponseArtifactGroup(
      "roots",
      [
        { source: "workspace", root: "workspace", path: "report.md" },
        { source: "workspace", root: "project", path: "report.md" },
        { source: "workspace", root: "project:C:/other", path: "report.md" },
        { source: "attachment", path: "report.md", artifactUrl: "/one" },
        { source: "attachment", path: "report.md", artifactUrl: "/two" },
      ],
      scope,
    );
    try {
      render(<Shelf />);
      expect(screen.getByRole("status").textContent?.split("|")).toHaveLength(
        5,
      );
    } finally {
      act(release);
    }
  });

  it("ignores stale cleanup after replacing a registration", () => {
    const oldRelease = setResponseArtifactGroup(
      "same-group",
      [{ source: "workspace", path: "old.md" }],
      scope,
    );
    const release = setResponseArtifactGroup(
      "same-group",
      [{ source: "workspace", path: "new.md" }],
      scope,
    );
    try {
      render(<Shelf />);
      act(oldRelease);
      expect(screen.getByRole("status")).toHaveTextContent("new.md");
      expect(screen.getByRole("status")).not.toHaveTextContent("old.md");
    } finally {
      act(release);
    }
  });
});

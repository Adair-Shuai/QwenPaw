import { apiUrl, getHost } from "../core/runtime";

function expertAvatarUrl(seed: string): string {
  return apiUrl(`/ugsci/avatar/${encodeURIComponent(seed)}`);
}

function teamAvatarUrl(memberNames: string[]): string {
  const joined = memberNames.map(encodeURIComponent).join(",");
  return apiUrl(`/ugsci/avatar/team/${joined}`);
}

export function ExpertAvatar({
  name,
  size = 32,
  borderRadius = "50%",
}: {
  name: string;
  size?: number;
  borderRadius?: string | number;
}) {
  const React = getHost().React;
  const [retry, setRetry] = React.useState(0);
  const source =
    retry === 0
      ? expertAvatarUrl(name)
      : `${expertAvatarUrl(name)}?_r=${retry}`;

  return React.createElement("img", {
    src: source,
    alt: name,
    onError: () => {
      if (retry < 1) setRetry(retry + 1);
    },
    style: {
      width: size,
      height: size,
      borderRadius,
      objectFit: "cover",
      flexShrink: 0,
    },
  });
}

export function TeamAvatar({
  members,
  size = 32,
  borderRadius = "50%",
}: {
  members: string[];
  size?: number;
  borderRadius?: string | number;
}) {
  const React = getHost().React;
  const [retry, setRetry] = React.useState(0);
  if (!members || members.length === 0) {
    return React.createElement("span", {
      style: {
        width: size,
        height: size,
        display: "inline-block",
      },
    });
  }

  const names = members.slice(0, 5);
  const source =
    retry === 0 ? teamAvatarUrl(names) : `${teamAvatarUrl(names)}?_r=${retry}`;
  return React.createElement("img", {
    src: source,
    alt: "team",
    onError: () => {
      if (retry < 1) setRetry(retry + 1);
    },
    style: {
      width: size,
      height: size,
      borderRadius,
      objectFit: "cover",
      flexShrink: 0,
    },
  });
}

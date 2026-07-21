import React from "react";
import { useStreamingTokens } from "../../turnUsage";

/**
 * Format a token count for compact display.
 * - < 1000: show as-is
 * - >= 1000: show as "X.XK"
 */
function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/**
 * A compact floating badge that shows the estimated output token count
 * in real-time while the AI is generating its response.
 *
 * The badge appears at the bottom-right of the chat messages area with a
 * pulsing dot animation to indicate active streaming. When streaming
 * completes, the badge fades out.
 *
 * The token count is estimated from streaming text using a character-based
 * heuristic (see `estimateTokensFromText` in turnUsage.ts). The exact count
 * is only known to the LLM provider after the response completes, which is
 * then shown by the `TurnUsageAction` ring on the response card.
 */
const StreamingTokenBadge: React.FC = () => {
  const { estimatedTokens, isStreaming } = useStreamingTokens();

  if (!isStreaming || estimatedTokens === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        right: 16,
        zIndex: 100,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 12,
        background: "rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(8px)",
        fontSize: 12,
        fontWeight: 500,
        color: "rgba(0, 0, 0, 0.65)",
        pointerEvents: "none",
        userSelect: "none",
        transition: "opacity 0.3s ease",
        animation: "streamingBadgeFadeIn 0.3s ease",
      }}
    >
      {/* Pulsing dot */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#52c41a",
          display: "inline-block",
          animation: "streamingBadgePulse 1.2s ease-in-out infinite",
        }}
      />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        ~{formatTokens(estimatedTokens)} tok
      </span>
      <style>{`
        @keyframes streamingBadgePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes streamingBadgeFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StreamingTokenBadge;

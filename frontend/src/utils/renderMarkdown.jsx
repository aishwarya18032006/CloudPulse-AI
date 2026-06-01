/**
 * Lightweight markdown for assistant messages (bold, lists, code blocks).
 */
export function renderMarkdown(text) {
  if (!text) return null;

  const blocks = text.split(/```/);

  return blocks.map((block, blockIndex) => {
    const isCode = blockIndex % 2 === 1;

    if (isCode) {
      const lines = block.split("\n");
      const code = lines[0]?.match(/^\w+/) ? lines.slice(1).join("\n") : block;
      return (
        <pre
          key={`code-${blockIndex}`}
          className="my-2 overflow-x-auto rounded-lg bg-black/10 px-3 py-2 font-mono text-[12px] leading-relaxed dark:bg-black/25"
        >
          <code>{code.trim()}</code>
        </pre>
      );
    }

    return (
      <span key={`text-${blockIndex}`}>
        {block.split("\n").map((line, lineIndex) => {
          const trimmed = line.trim();

          if (/^[-*]\s+/.test(trimmed)) {
            return (
              <li key={`${blockIndex}-${lineIndex}`} className="ml-4 list-disc">
                {renderInline(trimmed.replace(/^[-*]\s+/, ""))}
              </li>
            );
          }

          if (/^\d+\.\s+/.test(trimmed)) {
            return (
              <li key={`${blockIndex}-${lineIndex}`} className="ml-4 list-decimal">
                {renderInline(trimmed.replace(/^\d+\.\s+/, ""))}
              </li>
            );
          }

          if (!trimmed) {
            return <br key={`${blockIndex}-${lineIndex}`} />;
          }

          return (
            <p key={`${blockIndex}-${lineIndex}`} className={lineIndex > 0 ? "mt-1" : ""}>
              {renderInline(line)}
            </p>
          );
        })}
      </span>
    );
  });
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[12px] dark:bg-black/25">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

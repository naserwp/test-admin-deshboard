const headingRegex = /^(#{1,6})\s+(.*)$/;

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const renderInlineMarkdown = (line: string) => {
  let output = line;
  output = output.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*(.+?)\*/g, "<em>$1</em>");
  output = output.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return output;
};

export const renderMarkdown = (markdown: string) => {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;

  lines.forEach((rawLine) => {
    const line = escapeHtml(rawLine.trim());

    if (!line) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      return;
    }

    const headingMatch = line.match(headingRegex);
    if (headingMatch) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      const level = headingMatch[1].length;
      const headingText = renderInlineMarkdown(headingMatch[2]);
      const id = slugify(headingMatch[2]);
      html.push(`<h${level} id="${id}">${headingText}</h${level}>`);
      return;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
      return;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }

    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  if (inList) {
    html.push("</ul>");
  }

  return html.join("");
};

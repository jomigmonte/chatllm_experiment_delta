const { useEffect, useRef } = React;

// Lines that contain bare (undelimited) LaTeX math commands
const MATH_CMD_RE = /\\(?:frac|sqrt|sum|int|prod|lim|times|cdot|div|mathbf|mathit|mathrm|boldsymbol|left|right|begin|end|partial|nabla|over|underbrace|overbrace|hat|bar|vec|pm|mp|leq|geq|neq|approx|equiv|infty)\b/;

// Single-dollar math: $...$ where the content does NOT start with a digit (currency)
// Matches e.g. $n > 92$, $O(n)$, $\alpha$  — but NOT $3.00 or $100
const DOLLAR_MATH_RE = /(?<![\\$])\$(?!\$)(?!\d)((?:[^$\n\\]|\\.)+?)\$/g;

// Currency: bare $<digit> not preceded by $ or \
const CURRENCY_RE = /(?<![$\\])\$(\d)/g;

function preprocessMarkdown(text) {
  // 1. Convert model's single-dollar inline math to \(...\) so marked.js never touches it
  text = text.replace(DOLLAR_MATH_RE, (_, inner) => `\\(${inner}\\)`);

  // 2. Line-by-line: wrap bare LaTeX lines in $$...$$ and escape remaining currency
  const lines = text.split("\n");
  let inFence = false;
  return lines.map((line) => {
    if (/^```/.test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;

    const trimmed = line.trim();

    // Already has explicit math delimiters — leave untouched
    if (/^\$\$/.test(trimmed) || /^\\\[/.test(trimmed) || /^\\\(/.test(trimmed)) return line;

    // Bare LaTeX commands with no existing delimiters → wrap in $$...$$
    if (MATH_CMD_RE.test(trimmed) && !/\\\(|\\\[/.test(trimmed)) {
      const inner = trimmed.replace(CURRENCY_RE, "\\$$1");
      return `$$${inner}$$`;
    }

    // Normal text: convert remaining $<digit> to HTML entity so KaTeX ignores it
    return line.replace(CURRENCY_RE, "&#36;$1");
  }).join("\n");
}

function renderMarkdownAndLatex(rawText) {
  if (!window.marked || !window.DOMPurify) {
    const src = String(rawText || "");
    return src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  }

  // Preprocess: normalize $...$ and wrap bare LaTeX lines
  let source = preprocessMarkdown(String(rawText || ""));

  // Protect math blocks from marked.js backslash mangling (e.g. \( → ( in table cells)
  const saved = [];
  const save = (m) => { const i = saved.length; saved.push(m); return `\x02M${i}\x03`; };
  source = source
    .replace(/\$\$[\s\S]+?\$\$/g, save)
    .replace(/\\\[[\s\S]+?\\\]/g, save)
    .replace(/\\\([\s\S]+?\\\)/g, save);

  // Parse markdown — placeholders pass through untouched
  let html = window.marked.parse(source, { breaks: true, gfm: true });

  // Restore math blocks into the HTML
  html = html.replace(/\x02M(\d+)\x03/g, (_, i) => saved[+i]);

  return window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

function normalizeLanguageAlias(rawLanguage) {
  const language = String(rawLanguage || "")
    .trim()
    .toLowerCase()
    .replace(/^language-/, "");

  const aliases = {
    "c++": "cpp", cpp: "cpp", cxx: "cpp", cc: "cpp",
    c: "c",
    "c#": "csharp", cs: "csharp",
    java: "java", lua: "lua",
    asm: "x86asm", assembly: "x86asm", s: "x86asm",
    tex: "latex", latex: "latex",
    plain: "plaintext", text: "plaintext",
    shell: "bash", sh: "bash",
    yml: "yaml",
    js: "javascript", ts: "typescript", py: "python",
  };

  return aliases[language] || language;
}

function getLanguageFromCodeBlock(codeElement) {
  const classes = Array.from(codeElement.classList || []);
  const languageClass = classes.find((name) => name.startsWith("language-"));
  if (languageClass) return normalizeLanguageAlias(languageClass);
  return normalizeLanguageAlias(codeElement.getAttribute("data-language"));
}

function enhanceCodeBlocks(node) {
  node.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;

    let wrapper = pre.parentElement;
    if (!wrapper || !wrapper.classList.contains("code-block-wrap")) {
      wrapper = document.createElement("div");
      wrapper.className = "code-block-wrap";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }

    if (!wrapper.querySelector(".code-copy-btn")) {
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-btn";
      copyButton.textContent = "Copiar";
      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          copyButton.textContent = "Copiado";
        } catch {
          copyButton.textContent = "Erro";
        }
        setTimeout(() => { copyButton.textContent = "Copiar"; }, 1000);
      });
      wrapper.appendChild(copyButton);
    }
  });
}

function MessageContent({ content }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    node.innerHTML = renderMarkdownAndLatex(content);

    if (window.renderMathInElement) {
      window.renderMathInElement(node, {
        throwOnError: false,
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
      });
    }

    if (window.hljs) {
      node.querySelectorAll("pre code").forEach((block) => {
        const lang = getLanguageFromCodeBlock(block);
        if (lang && window.hljs.getLanguage(lang)) {
          block.innerHTML = window.hljs.highlight(block.textContent || "", { language: lang }).value;
          block.className = `hljs language-${lang}`;
        } else {
          window.hljs.highlightElement(block);
        }
      });
    }

    enhanceCodeBlocks(node);
  }, [content]);

  return <div ref={containerRef} />;
}

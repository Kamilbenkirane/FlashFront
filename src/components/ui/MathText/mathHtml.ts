import katex from 'katex';
import type { Options as RehypeKatexOptions } from 'rehype-katex';
import rehypeKatex from 'rehype-katex';
import type { Options as RehypeSanitizeOptions } from 'rehype-sanitize';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import type { MathTextLayoutMode } from './MathText.types';

interface MathHtmlOptions {
  textColor: string;
  fontSize: number;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'center';
}

interface MathTextDocumentOptions {
  layoutMode?: MathTextLayoutMode;
}

const KATEX_STYLESHEET_URL = `https://cdn.jsdelivr.net/npm/katex@${katex.version}/dist/katex.min.css`;
const CODE_SEGMENT_PATTERN = /```[\s\S]*?```|`[^`\n]+`/g;
const MATH_DELIMITER_PATTERNS = [
  /\\\([\s\S]+?\\\)/,
  /\\\[[\s\S]+?\\\]/,
  /\$\$[\s\S]+?\$\$/,
  /\$(?!\$)[^$\n]+?\$(?!\$)/,
];
const RICH_TEXT_PATTERNS = [
  /(^|\n)\s*#{1,6}\s/,
  /(^|\n)\s*(?:[-*+] |\d+\. )/,
  /(^|\n)\s*>\s?/,
  /\[[^\]]+\]\([^)]+\)/,
  /`{1,3}/,
  /\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~/,
  /\n/,
];

const mathSanitizeSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ['className', /^language-./, 'math-inline', 'math-display'],
    ],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'input'],
};
const katexOptions: RehypeKatexOptions = {
  output: 'htmlAndMathml',
  strict: 'ignore',
};

export const containsMathTextMarkup = (content: string) =>
  MATH_DELIMITER_PATTERNS.some((pattern) => pattern.test(content));

export const containsRichTextMarkup = (content: string) =>
  containsMathTextMarkup(content) ||
  RICH_TEXT_PATTERNS.some((pattern) => pattern.test(content));

export const normalizePlainTextContent = (content: string) =>
  content
    .split('\r\n')
    .join('\n')
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        return '';
      }

      return trimmedLine.startsWith('- ')
        ? `• ${trimmedLine.slice(2)}`
        : trimmedLine;
    })
    .join('\n')
    .trim();

const escapeCssValue = (value: string) => value.split('"').join('\\"');

const protectCodeSegments = (content: string) => {
  const replacements: Array<{ token: string; value: string }> = [];
  const protectedContent = content.replace(CODE_SEGMENT_PATTERN, (segment) => {
    const token = `@@MATH_TEXT_CODE_SEGMENT_${replacements.length}@@`;
    replacements.push({ token, value: segment });
    return token;
  });

  return {
    protectedContent,
    restore: (value: string) => {
      let restored = value;
      for (const replacement of replacements) {
        restored = restored.split(replacement.token).join(replacement.value);
      }
      return restored;
    },
  };
};

export const normalizeMarkdownMathContent = (content: string) => {
  const normalizedLineEndings = content.split('\r\n').join('\n');
  const { protectedContent, restore } = protectCodeSegments(
    normalizedLineEndings,
  );

  const normalized = protectedContent
    .replace(/\\\[\s*([\s\S]+?)\s*\\\]/g, (_match, expression: string) => {
      const trimmedExpression = expression.trim();
      return trimmedExpression
        ? `\n\n$$\n${trimmedExpression}\n$$\n\n`
        : _match;
    })
    .replace(/\\\(\s*([\s\S]+?)\s*\\\)/g, (_match, expression: string) => {
      const trimmedExpression = expression.trim();
      return trimmedExpression ? `$${trimmedExpression}$` : _match;
    });

  const restoredContent = restore(normalized).replace(/\n{3,}/g, '\n\n');
  return restoredContent.endsWith('\n\n')
    ? restoredContent.slice(0, -1)
    : restoredContent;
};

const renderRichContent = (content: string) =>
  String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath, { singleDollarTextMath: true })
      .use(remarkRehype)
      .use(rehypeSanitize, mathSanitizeSchema)
      .use(rehypeKatex, katexOptions)
      .use(rehypeStringify)
      .processSync(normalizeMarkdownMathContent(content)),
  );

const createStyleBlock = (
  {
    textColor,
    fontSize,
    lineHeight,
    textAlign,
    verticalAlign,
  }: MathHtmlOptions,
  layoutMode: MathTextLayoutMode,
) => {
  const blockSpacing = Math.max(8, Math.round(lineHeight * 0.35));
  const inlineCodePadding = Math.max(2, Math.round(fontSize * 0.12));
  const fillHeight = layoutMode === 'fill' ? '100%' : 'auto';
  const justifyContent =
    layoutMode === 'fill' && verticalAlign === 'center'
      ? 'center'
      : 'flex-start';

  return `
    <style>
      :root {
        color-scheme: light dark;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: ${fillHeight};
        height: ${fillHeight};
        background: transparent;
        color: ${escapeCssValue(textColor)};
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        overflow: hidden;
      }

      body {
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      .math-root {
        min-height: ${layoutMode === 'fill' ? '100%' : 'auto'};
        display: flex;
        flex-direction: column;
        justify-content: ${justifyContent};
        align-items: stretch;
        text-align: ${textAlign};
        color: inherit;
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      .math-root > :first-child {
        margin-top: 0;
      }

      .math-root > :last-child {
        margin-bottom: 0;
      }

      .math-root p,
      .math-root ul,
      .math-root ol,
      .math-root pre,
      .math-root blockquote,
      .math-root h1,
      .math-root h2,
      .math-root h3,
      .math-root h4,
      .math-root h5,
      .math-root h6,
      .math-root table {
        margin-top: 0;
        margin-bottom: ${blockSpacing}px;
      }

      .math-root p,
      .math-root li,
      .math-root blockquote,
      .math-root td,
      .math-root th {
        color: inherit;
        font-size: inherit;
        line-height: inherit;
      }

      .math-root h1,
      .math-root h2,
      .math-root h3,
      .math-root h4,
      .math-root h5,
      .math-root h6 {
        color: inherit;
        font-weight: 600;
      }

      .math-root h1 {
        font-size: ${Math.round(fontSize * 1.2)}px;
        line-height: ${Math.round(lineHeight * 1.15)}px;
      }

      .math-root h2 {
        font-size: ${Math.round(fontSize * 1.08)}px;
        line-height: ${Math.round(lineHeight * 1.08)}px;
      }

      .math-root h3,
      .math-root h4,
      .math-root h5,
      .math-root h6 {
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
      }

      .math-root ul,
      .math-root ol {
        padding-left: 1.35em;
      }

      .math-root li {
        margin-bottom: ${Math.max(4, Math.round(blockSpacing * 0.55))}px;
      }

      .math-root li:last-child {
        margin-bottom: 0;
      }

      .math-root pre {
        padding: ${Math.max(12, Math.round(blockSpacing * 1.2))}px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.06);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .math-root code {
        font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      }

      .math-root :not(pre) > code {
        padding: ${inlineCodePadding}px ${Math.max(6, inlineCodePadding * 3)}px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.06);
      }

      .math-root blockquote {
        margin-left: 0;
        padding-left: ${Math.max(12, Math.round(blockSpacing * 1.1))}px;
        border-left: 3px solid rgba(15, 23, 42, 0.18);
      }

      .math-root a {
        color: inherit;
        text-decoration: underline;
      }

      .math-root table {
        width: 100%;
        border-collapse: collapse;
      }

      .math-root th,
      .math-root td {
        border: 1px solid rgba(15, 23, 42, 0.12);
        padding: 8px 10px;
        text-align: left;
      }

      .math-root img {
        max-width: 100%;
        height: auto;
      }

      .math-root .katex-display {
        margin: ${Math.max(10, blockSpacing)}px 0;
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: 2px;
      }

      .math-root .katex-display > .katex {
        display: inline-block;
      }

      .math-root .katex,
      .math-root .katex * {
        color: inherit;
      }
    </style>
  `;
};

const createDocumentHead = (
  options: MathHtmlOptions,
  layoutMode: MathTextLayoutMode,
) => `
  <link rel="stylesheet" href="${KATEX_STYLESHEET_URL}" />
  ${createStyleBlock(options, layoutMode)}
`;

export const createMathTextMarkup = (
  content: string,
  options: MathHtmlOptions,
) => {
  const layoutMode: MathTextLayoutMode = 'fill';
  return `${createDocumentHead(options, layoutMode)}<div class="math-root">${renderRichContent(
    content,
  )}</div>`;
};

export const createMathTextDocument = (
  content: string,
  options: MathHtmlOptions,
  { layoutMode = 'fill' }: MathTextDocumentOptions = {},
) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />
    ${createDocumentHead(options, layoutMode)}
  </head>
  <body>
    <div class="math-root">${renderRichContent(content)}</div>
  </body>
</html>`;

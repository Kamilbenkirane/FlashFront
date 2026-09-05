import {
  containsMathTextMarkup,
  containsRichTextMarkup,
  createMathTextDocument,
  createMathTextMarkup,
  normalizeMarkdownMathContent,
  normalizePlainTextContent,
} from '@/components/ui/MathText/mathHtml';
import { describe, expect, it } from 'vitest';

describe('mathHtml', () => {
  it('detects when content needs math rendering', () => {
    expect(containsMathTextMarkup('Simple definition card')).toBe(false);
    expect(containsMathTextMarkup('Mean: \\(\\mu\\)')).toBe(true);
    expect(containsMathTextMarkup('\\[\\frac{1}{2}\\]')).toBe(true);
    expect(containsMathTextMarkup('$$x^2$$')).toBe(true);
  });

  it('detects when rich markdown or multiline content needs the HTML renderer', () => {
    expect(containsRichTextMarkup('Simple definition card')).toBe(false);
    expect(containsRichTextMarkup('## Solve for $x$')).toBe(true);
    expect(containsRichTextMarkup('Line one\nLine two')).toBe(true);
  });

  it('normalizes plain text without requiring a WebView', () => {
    expect(
      normalizePlainTextContent(
        '  Title  \r\n- first point\r\n- second point  ',
      ),
    ).toBe('Title\n• first point\n• second point');
  });

  it('normalizes backslash math delimiters into markdown-friendly syntax', () => {
    expect(
      normalizeMarkdownMathContent('Mean: \\(\\mu\\)\n\\[\\frac{1}{2}\\]'),
    ).toBe('Mean: $\\mu$\n\n$$\n\\frac{1}{2}\n$$\n');
  });

  it('renders markdown headings, lists, and inline math with KaTeX HTML', () => {
    const markup = createMathTextMarkup(
      '## Summary\n- Mean: \\(\\mu\\)\n- Variance: $\\sigma^2$',
      {
        textColor: '#111111',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
        verticalAlign: 'center',
      },
    );

    expect(markup).toContain('<h2>Summary</h2>');
    expect(markup).toContain('class="katex"');
    expect(markup).toContain('μ');
    expect(markup).toContain('σ');
  });

  it('builds an auto-height HTML document shell for chat rendering', () => {
    const document = createMathTextDocument(
      '\\[\\frac{1}{2}\\]',
      {
        textColor: '#111111',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'left',
        verticalAlign: 'top',
      },
      { layoutMode: 'auto' },
    );

    expect(document).toContain('<!DOCTYPE html>');
    expect(document).toContain('katex.min.css');
    expect(document).toContain('class="katex-display"');
    expect(document).not.toContain('window.ReactNativeWebView.postMessage');
  });
});

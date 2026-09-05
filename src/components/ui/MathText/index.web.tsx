import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { MathText as NativeMathText } from './MathText.native';
import type { MathTextProps } from './MathText.types';
import { containsRichTextMarkup, createMathTextDocument } from './mathHtml';

export { containsRichTextMarkup } from './mathHtml';

/** Reuse the sanitized document on web; native WebView has no browser renderer. */
const RichMathText = ({
  content,
  textColor,
  fontSize,
  lineHeight,
  textAlign = 'center',
  verticalAlign = 'center',
  layoutMode = 'fill',
  fillContainer = true,
  disablePointerEvents = true,
  hideFromAccessibility = true,
  style,
}: MathTextProps) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const html = useMemo(
    () =>
      createMathTextDocument(
        content,
        { textColor, fontSize, lineHeight, textAlign, verticalAlign },
        { layoutMode },
      ),
    [
      content,
      textColor,
      fontSize,
      lineHeight,
      textAlign,
      verticalAlign,
      layoutMode,
    ],
  );
  useEffect(() => {
    const element = frame.current;
    if (!element || layoutMode !== 'auto') return;
    let observer: ResizeObserver | undefined;
    const measure = () => {
      const root = element.contentDocument?.querySelector('.math-root');
      if (!root) return;
      const resize = () => {
        element.style.height = `${Math.ceil(root.scrollHeight)}px`;
      };
      observer?.disconnect();
      observer = new ResizeObserver(resize);
      observer.observe(root);
      resize();
    };
    element.addEventListener('load', measure);
    measure();
    return () => {
      element.removeEventListener('load', measure);
      observer?.disconnect();
    };
  }, [html, layoutMode]);
  return (
    <View
      style={[
        {
          width: '100%',
          minHeight: lineHeight,
          flex: fillContainer ? 1 : undefined,
        },
        style,
      ]}
      pointerEvents={disablePointerEvents ? 'none' : 'auto'}
    >
      <iframe
        ref={frame}
        title="Study content"
        srcDoc={html}
        sandbox="allow-same-origin"
        aria-hidden={hideFromAccessibility}
        tabIndex={disablePointerEvents ? -1 : 0}
        style={{
          border: 0,
          width: '100%',
          height: layoutMode === 'auto' ? lineHeight : '100%',
          minHeight: lineHeight,
          background: 'transparent',
          colorScheme: 'normal',
        }}
      />
    </View>
  );
};

export const MathText = (props: MathTextProps) =>
  containsRichTextMarkup(props.content) ? (
    <RichMathText {...props} />
  ) : (
    <NativeMathText {...props} />
  );

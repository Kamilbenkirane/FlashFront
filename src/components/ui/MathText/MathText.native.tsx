import type { MathTextProps } from '@/components/ui/MathText/MathText.types';
import {
  containsRichTextMarkup,
  createMathTextDocument,
  normalizePlainTextContent,
} from '@/components/ui/MathText/mathHtml';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';

const RICH_TEXT_MEASUREMENT_SCRIPT = `
  (function () {
    var lastPayload = '';
    var pending = false;

    function postHeight() {
      pending = false;

      var body = document.body;
      var documentElement = document.documentElement;
      if (!body || !documentElement || !window.ReactNativeWebView) {
        return;
      }

      var nextHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        documentElement.scrollHeight,
        documentElement.offsetHeight
      );
      var nextWidth = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        documentElement.scrollWidth,
        documentElement.offsetWidth
      );

      nextHeight = Math.ceil(nextHeight);
      nextWidth = Math.ceil(nextWidth);
      if (!nextHeight || !nextWidth) {
        return;
      }

      var payload = JSON.stringify({
        height: nextHeight,
        width: nextWidth
      });
      if (payload === lastPayload) {
        return;
      }

      lastPayload = payload;
      window.ReactNativeWebView.postMessage(payload);
    }

    function schedulePostHeight() {
      if (pending) {
        return;
      }

      pending = true;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(postHeight);
      });
    }

    if (typeof ResizeObserver === 'function') {
      var resizeObserver = new ResizeObserver(schedulePostHeight);
      resizeObserver.observe(document.documentElement);
      resizeObserver.observe(document.body);
    } else if (typeof MutationObserver === 'function') {
      var mutationObserver = new MutationObserver(schedulePostHeight);
      mutationObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedulePostHeight);
    }

    window.addEventListener('resize', schedulePostHeight);

    schedulePostHeight();
    setTimeout(schedulePostHeight, 120);
    setTimeout(schedulePostHeight, 360);
    setTimeout(schedulePostHeight, 900);
  })();
  true;
`;

interface MeasuredSize {
  height: number;
  width: number;
}

const parseMeasuredSize = (payload: string): MeasuredSize | null => {
  try {
    const parsedPayload = JSON.parse(payload) as Partial<MeasuredSize>;
    const nextHeight = Math.ceil(Number(parsedPayload.height));
    const nextWidth = Math.ceil(Number(parsedPayload.width));
    if (
      Number.isFinite(nextHeight) &&
      nextHeight > 0 &&
      Number.isFinite(nextWidth) &&
      nextWidth > 0
    ) {
      return {
        height: nextHeight,
        width: nextWidth,
      };
    }
  } catch {
    const nextHeight = Math.ceil(Number(payload));
    if (Number.isFinite(nextHeight) && nextHeight > 0) {
      return {
        height: nextHeight,
        width: 0,
      };
    }
  }

  return null;
};

export const MathText: React.FC<MathTextProps> = ({
  content,
  textColor,
  fontSize,
  lineHeight,
  textAlign = 'center',
  verticalAlign = 'center',
  fillContainer = true,
  layoutMode = 'fill',
  disablePointerEvents = true,
  hideFromAccessibility = true,
  style,
  renderKey,
}) => {
  const usesRichMarkup = useMemo(
    () => containsRichTextMarkup(content),
    [content],
  );
  const usesAutoHeight = usesRichMarkup && layoutMode === 'auto';
  const [webViewHeight, setWebViewHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!usesAutoHeight) {
      setWebViewHeight(null);
    }
  }, [usesAutoHeight]);

  const plainTextContent = useMemo(
    () => normalizePlainTextContent(content),
    [content],
  );
  const html = useMemo(
    () =>
      usesRichMarkup
        ? createMathTextDocument(
            content,
            {
              textColor,
              fontSize,
              lineHeight,
              textAlign,
              verticalAlign,
            },
            { layoutMode },
          )
        : '',
    [
      content,
      layoutMode,
      fontSize,
      lineHeight,
      textAlign,
      textColor,
      usesRichMarkup,
      verticalAlign,
    ],
  );
  const handleWebViewMessage = ({ nativeEvent }: WebViewMessageEvent) => {
    const nextSize = parseMeasuredSize(nativeEvent.data);
    if (!nextSize) {
      return;
    }

    if (usesAutoHeight) {
      setWebViewHeight((currentHeight) =>
        currentHeight === nextSize.height ? currentHeight : nextSize.height,
      );
    }
  };

  if (!usesRichMarkup) {
    return (
      <View
        pointerEvents={disablePointerEvents ? 'none' : 'auto'}
        style={[
          fillContainer ? styles.fillContainer : styles.inlineContainer,
          style,
        ]}
        accessible={hideFromAccessibility ? false : undefined}
        importantForAccessibility={
          hideFromAccessibility ? 'no-hide-descendants' : 'auto'
        }
      >
        <Text
          style={[
            styles.nativeText,
            {
              color: textColor,
              fontSize,
              lineHeight,
              textAlign,
            },
          ]}
        >
          {plainTextContent}
        </Text>
      </View>
    );
  }

  return (
    <View
      pointerEvents={disablePointerEvents ? 'none' : 'auto'}
      style={[
        fillContainer ? styles.fillContainer : styles.inlineContainer,
        usesAutoHeight && { minHeight: lineHeight },
        style,
      ]}
      accessible={hideFromAccessibility ? false : undefined}
      importantForAccessibility={
        hideFromAccessibility ? 'no-hide-descendants' : 'auto'
      }
    >
      <WebView
        key={renderKey}
        originWhitelist={['*']}
        source={{ html }}
        style={[
          styles.webView,
          usesAutoHeight
            ? { height: webViewHeight ?? lineHeight }
            : styles.fillWebView,
        ]}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={usesAutoHeight}
        injectedJavaScript={
          usesAutoHeight ? RICH_TEXT_MEASUREMENT_SCRIPT : undefined
        }
        cacheEnabled={false}
        opaque={false}
        onMessage={handleWebViewMessage}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fillContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  inlineContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  webView: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  fillWebView: {
    flex: 1,
  },
  nativeText: {
    width: '100%',
  },
});

import type { MathTextProps } from '@/components/ui/MathText/MathText.types';
import {
  DEFAULT_MATH_TEXT_FIT_STEP_PX,
  DEFAULT_MATH_TEXT_MIN_FONT_SCALE,
  buildFitFontSizes,
  getNextFitIndex,
  scaleLineHeight,
} from '@/components/ui/MathText/fitText';
import {
  containsRichTextMarkup,
  createMathTextDocument,
  normalizePlainTextContent,
} from '@/components/ui/MathText/mathHtml';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
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
  fitMode = 'none',
  minFontScale = DEFAULT_MATH_TEXT_MIN_FONT_SCALE,
  fitStepPx = DEFAULT_MATH_TEXT_FIT_STEP_PX,
}) => {
  const usesRichMarkup = useMemo(
    () => containsRichTextMarkup(content),
    [content],
  );
  const usesAutoHeight = usesRichMarkup && layoutMode === 'auto';
  const shouldShrinkToFit = fitMode === 'shrinkToFit';
  const shouldMeasureRichContent =
    usesRichMarkup && (usesAutoHeight || shouldShrinkToFit);
  const fitFontSizes = useMemo(
    () =>
      shouldShrinkToFit
        ? buildFitFontSizes({
            fontSize,
            minFontScale,
            fitStepPx,
          })
        : [fontSize],
    [fitStepPx, fontSize, minFontScale, shouldShrinkToFit],
  );
  const [fitIndex, setFitIndex] = useState(0);
  const [containerSize, setContainerSize] = useState<MeasuredSize | null>(null);
  const [measuredContentSize, setMeasuredContentSize] =
    useState<MeasuredSize | null>(null);
  const [measuredFontSize, setMeasuredFontSize] = useState<number | null>(null);
  const [webViewHeight, setWebViewHeight] = useState<number | null>(null);
  const fitCacheRef = useRef<Record<string, number>>({});
  const resolvedFontSize =
    fitFontSizes[Math.min(fitIndex, fitFontSizes.length - 1)] ?? fontSize;
  const resolvedLineHeight = useMemo(
    () =>
      scaleLineHeight({
        fontSize,
        lineHeight,
        nextFontSize: resolvedFontSize,
      }),
    [fontSize, lineHeight, resolvedFontSize],
  );

  useEffect(() => {
    if (!usesAutoHeight) {
      setWebViewHeight(null);
    }
  }, [usesAutoHeight]);

  const plainTextContent = useMemo(
    () => normalizePlainTextContent(content),
    [content],
  );
  const fitContentKey = usesRichMarkup ? content : plainTextContent;
  const fitCacheKey = useMemo(() => {
    if (!shouldShrinkToFit || !containerSize?.height || !containerSize.width) {
      return null;
    }

    return [
      renderKey ?? 'math-text',
      usesRichMarkup ? 'rich' : 'plain',
      fitContentKey,
      Math.round(containerSize.width),
      Math.round(containerSize.height),
      fontSize,
      lineHeight,
      minFontScale,
      fitStepPx,
    ].join(':');
  }, [
    containerSize?.height,
    containerSize?.width,
    fitStepPx,
    fitContentKey,
    fontSize,
    lineHeight,
    minFontScale,
    renderKey,
    shouldShrinkToFit,
    usesRichMarkup,
  ]);

  useEffect(() => {
    setMeasuredContentSize(null);
    setMeasuredFontSize(null);
  }, [
    containerSize?.height,
    containerSize?.width,
    content,
    fitStepPx,
    fontSize,
    lineHeight,
    minFontScale,
    renderKey,
    shouldShrinkToFit,
    usesRichMarkup,
  ]);

  useEffect(() => {
    if (!shouldShrinkToFit) {
      setFitIndex(0);
      return;
    }

    if (!fitCacheKey) {
      setFitIndex(0);
      return;
    }

    const cachedFontSize = fitCacheRef.current[fitCacheKey];
    if (cachedFontSize === undefined) {
      setFitIndex(0);
      return;
    }

    const cachedFitIndex = fitFontSizes.findIndex(
      (candidate) => Math.abs(candidate - cachedFontSize) < 0.01,
    );
    setFitIndex(cachedFitIndex >= 0 ? cachedFitIndex : 0);
  }, [fitCacheKey, fitFontSizes, shouldShrinkToFit]);

  const html = useMemo(
    () =>
      usesRichMarkup
        ? createMathTextDocument(
            content,
            {
              textColor,
              fontSize: resolvedFontSize,
              lineHeight: resolvedLineHeight,
              textAlign,
              verticalAlign,
            },
            { layoutMode },
          )
        : '',
    [
      content,
      layoutMode,
      resolvedFontSize,
      resolvedLineHeight,
      textAlign,
      textColor,
      usesRichMarkup,
      verticalAlign,
    ],
  );
  const handleContainerLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(nativeEvent.layout.height);
    const nextWidth = Math.ceil(nativeEvent.layout.width);
    if (nextHeight <= 0 || nextWidth <= 0) {
      return;
    }

    setContainerSize((currentSize) =>
      currentSize?.height === nextHeight && currentSize?.width === nextWidth
        ? currentSize
        : {
            height: nextHeight,
            width: nextWidth,
          },
    );
  };

  const recordMeasuredSize = (nextSize: MeasuredSize) => {
    if (!shouldShrinkToFit) {
      return;
    }

    const normalizedHeight = Math.ceil(nextSize.height);
    const normalizedWidth = Math.ceil(nextSize.width);
    if (normalizedHeight <= 0 || normalizedWidth < 0) {
      return;
    }

    setMeasuredContentSize((currentSize) =>
      currentSize?.height === normalizedHeight &&
      currentSize?.width === normalizedWidth
        ? currentSize
        : {
            height: normalizedHeight,
            width: normalizedWidth,
          },
    );
    setMeasuredFontSize((currentSize) =>
      currentSize === resolvedFontSize ? currentSize : resolvedFontSize,
    );
  };

  const handlePlainTextLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    recordMeasuredSize({
      height: nativeEvent.layout.height,
      width: nativeEvent.layout.width,
    });
  };

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

    recordMeasuredSize(nextSize);
  };

  useEffect(() => {
    if (
      !shouldShrinkToFit ||
      !containerSize ||
      !measuredContentSize ||
      measuredFontSize !== resolvedFontSize
    ) {
      return;
    }

    const nextFitIndex = getNextFitIndex({
      currentIndex: fitIndex,
      fitFontSizes,
      availableHeight: containerSize.height,
      availableWidth: containerSize.width,
      measuredHeight: measuredContentSize.height,
      measuredWidth: measuredContentSize.width,
    });

    if (nextFitIndex !== fitIndex) {
      setFitIndex(nextFitIndex);
      return;
    }

    if (fitCacheKey) {
      fitCacheRef.current[fitCacheKey] = resolvedFontSize;
    }
  }, [
    containerSize,
    fitCacheKey,
    fitFontSizes,
    fitIndex,
    measuredContentSize,
    measuredFontSize,
    resolvedFontSize,
    shouldShrinkToFit,
  ]);

  if (!usesRichMarkup) {
    return (
      <View
        onLayout={handleContainerLayout}
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
          onLayout={handlePlainTextLayout}
          style={[
            styles.nativeText,
            {
              color: textColor,
              fontSize: resolvedFontSize,
              lineHeight: resolvedLineHeight,
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
      onLayout={handleContainerLayout}
      pointerEvents={disablePointerEvents ? 'none' : 'auto'}
      style={[
        fillContainer ? styles.fillContainer : styles.inlineContainer,
        usesAutoHeight && { minHeight: resolvedLineHeight },
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
            ? { height: webViewHeight ?? resolvedLineHeight }
            : styles.fillWebView,
        ]}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={shouldMeasureRichContent}
        injectedJavaScript={
          shouldMeasureRichContent ? RICH_TEXT_MEASUREMENT_SCRIPT : undefined
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

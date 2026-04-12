import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

// Breakpoints, picked to match common iPhone / iPad / laptop widths.
//   phone   : < 600   (iPhone, small Android)
//   tablet  : 600–1023 (iPad portrait, iPad mini)
//   desktop : ≥ 1024  (iPad landscape, laptops, desktops, web)
export const BREAKPOINTS = {
  tablet: 600,
  desktop: 1024,
};

function classify(width) {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
}

/**
 * useBreakpoint — returns the current responsive bucket and live width.
 * Re-renders whenever the window is resized (important for web/iPad split-view).
 */
export default function useBreakpoint() {
  const [dims, setDims] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDims(window));
    return () => sub?.remove?.();
  }, []);

  const bp = classify(dims.width);
  return {
    width: dims.width,
    height: dims.height,
    breakpoint: bp,
    isPhone: bp === 'phone',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    isWide: bp !== 'phone',
  };
}

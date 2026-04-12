import { Dimensions, PixelRatio, Platform } from 'react-native';

// Baseline: iPhone 14 / 15 (width 390). Everything is tuned against this.
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width, height } = Dimensions.get('window');
const shortDim = Math.min(width, height);
const longDim = Math.max(width, height);

// Raw ratios so we can clamp them before use.
const widthRatio = shortDim / BASE_WIDTH;
const heightRatio = longDim / BASE_HEIGHT;

// Clamp so tiny phones don't shrink past readability and iPads don't explode.
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Scale a horizontal dimension (widths, paddings).
export function wp(size) {
  return Math.round(size * clamp(widthRatio, 0.85, 1.25));
}

// Scale a vertical dimension.
export function hp(size) {
  return Math.round(size * clamp(heightRatio, 0.85, 1.25));
}

// Scale a font size — more conservative so text never feels huge on tablets
// or squished on small phones. Also rounds to the nearest pixel.
export function fp(size) {
  const scaled = size * clamp(widthRatio, 0.9, 1.15);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

// Moderate scale — used for component sizes that should grow a little but
// not proportionally (icons, avatars, pill heights).
export function ms(size, factor = 0.5) {
  return Math.round(size + (wp(size) - size) * factor);
}

export const screen = {
  width,
  height,
  isSmall: shortDim < 360,
  isLarge: shortDim >= 430,
  isTablet: shortDim >= 600,
};

export default { wp, hp, fp, ms, screen };

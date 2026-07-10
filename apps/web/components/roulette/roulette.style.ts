const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

const interpolateAtDistance = (
  distance: number,
  keyframes: [number, number][],
) => {
  const clamped = clamp(
    distance,
    keyframes[0]![0],
    keyframes[keyframes.length - 1]![0],
  );
  for (let i = 0; i < keyframes.length - 1; i++) {
    const [fromDistance, fromValue] = keyframes[i]!;
    const [toDistance, toValue] = keyframes[i + 1]!;
    if (clamped >= fromDistance && clamped <= toDistance) {
      const t = (clamped - fromDistance) / (toDistance - fromDistance);
      return lerp(fromValue, toValue, t);
    }
  }
  return keyframes[keyframes.length - 1]![1];
};

export const rouletteItemOpacity = (distance: number) =>
  interpolateAtDistance(distance, [
    [0, 0.8],
    [1, 0.1],
    [2, 0.04],
    [3, 0],
  ]);

export const rouletteItemScale = (distance: number) =>
  interpolateAtDistance(distance, [
    [0, 1],
    [1, 1],
    [2, 0.45],
    [3, 0.3],
  ]);

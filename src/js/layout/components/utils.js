import { MAX_SCALE, MIN_SCALE } from "../../constants/constants";

export const zoomInCondition = scale => {
  return scale >= MAX_SCALE;
};

export const zoomOutCondition = scale => {
  return scale <= MIN_SCALE;
};

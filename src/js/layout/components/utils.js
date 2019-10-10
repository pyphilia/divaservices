import { MAX_SCALE, MIN_SCALE } from "../../constants/constants";
import {
  ATTR_TYPE_ALLOWED,
  ATTR_TYPE,
  IN_PORT_CLASS
} from "../../constants/selectors";

export const zoomInCondition = scale => {
  return scale >= MAX_SCALE;
};

export const zoomOutCondition = scale => {
  return scale <= MIN_SCALE;
};

// matching algorithm for ports to be linked and highlighted
/* eslint-disable-next-line no-unused-vars */
export const validateConnection = (vS, mS, vT, mT, end, lV) => {
  if (!mT) {
    return false;
  }
  if (vS === vT) {
    return false;
  }
  if (mT.getAttribute("port-group") !== IN_PORT_CLASS) {
    return false;
  }

  // input accept only one source
  const usedInPorts = vT.model.attributes.getUsedInPorts();
  const matchId = usedInPorts.find(({ id }) => id === mT.getAttribute("port"));
  if (matchId) {
    return false;
  }

  // allow only same input-output type
  if (
    mT.getAttribute(ATTR_TYPE) === undefined ||
    mS.getAttribute(ATTR_TYPE) === undefined
  ) {
    return false;
  }

  // check allowed type
  const allowedS = mS.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const allowedT = mT.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const commonType = allowedS.filter(value => -1 !== allowedT.indexOf(value));
  if (commonType.length == 0) {
    return false;
  }

  return true;
};

// @flow

import type { Offset, Layout, Size } from './SizeTypes';


type ElementWidthFunction =
  ((hierarchyLevel: number, count: number, totalWidth: number) => number);


  export const defaults = {
  minWidthForMultipleElements: 300,
  maxMobileLayoutSizeInPixels: {
    width: 768,
    height: 500,
  },
  widthFunction(hierarchyLevel: number, count: number, totalWidth: number) {
    if (count === 2 && hierarchyLevel === 0) return totalWidth / 3;
    return Math.floor(totalWidth / count);
  },
};


const layoutCSS = (params: {
  size: Size,
  offset: Offset,
  isVisible: boolean,
}): Layout => ({
  offset: params.offset,
  size: params.size,
  style: {
    width: `${params.size[0]}px`,
    height: `${params.size[1]}px`,
    opacity: params.isVisible ? '1' : '0',
    top: '0',
    left: '0',
    position: 'absolute',
    transform: `translate3d(${params.offset[0]}px, ${params.offset[1]}, 0)`,
  },
});


type Params = {
  elementCount: number,
  containerSize: Size,
  widthFunction?: ElementWidthFunction,
  minWidthForMultipleElements?: number,
};


export function layoutStylesForOneVisibleElement({
  elementCount,
  containerSize,
}: {
  elementCount: number,
  containerSize: Size,
}): Layout[] {
  // Leave elements in higher hierarchy levels opaque,
  // but move them outside the viewport + stack them there.
  return Array.apply(null, Array(elementCount + 1))
    .map((el, index) => layoutCSS(Object.assign({}, {
      size: containerSize,
      offset: [index * containerSize[0], 0],
      isVisible: index === elementCount - 1,
    })));
}


export default function layoutStylesForHierarchyElements({
  elementCount,
  containerSize,
  widthFunction = defaults.widthFunction,
  minWidthForMultipleElements = defaults.minWidthForMultipleElements,
}: Params): Layout[] {
  let offsetX: ?number = null;

  // The following is a bit more complex to avoid non-integer subpixel widths

  const maxElementCountOnScreen = Math.max(
    1,
    Math.floor(containerSize[0] / minWidthForMultipleElements),
  );

  if (maxElementCountOnScreen === 1) {
    return layoutStylesForOneVisibleElement({ elementCount, containerSize });
  }

  const visibleControllerCount = Math.min(
    maxElementCountOnScreen,
    elementCount,
  );

  offsetX = null;

  return Array.apply(null, Array(elementCount + 1)).map((index) => {
    let width;

    if (index === elementCount - 1) {
      // Fit last element exactly
      width = containerSize[0] - (offsetX || 0);
    } else if (index === elementCount) {
      // Popped or pushed element, outside the viewport
      width = Math.floor(widthFunction(index - 1, visibleControllerCount - 1, containerSize[0]));
    } else {
      width = Math.floor(widthFunction(index, visibleControllerCount, containerSize[0]));
    }

    if (offsetX === null) {
      offsetX = -(elementCount - visibleControllerCount) * width;
    }

    const result = layoutCSS({
      offset: [offsetX || 0, 0],
      size: [width, containerSize[1]],
      isVisible: index !== elementCount,
    });

    offsetX += width;

    return result;
  });
}

// Drag-to-scroll for mouse pointers. Real touch already scrolls natively, but a touchscreen
// whose compositor turns touches into mouse events (labwc mouseEmulation) would otherwise
// only "click". With this, a finger drag still scrolls any scrollable list on any screen.

const DRAG_THRESHOLD_PX = 8;

function isScrollable(element: HTMLElement): boolean {
  const overflowY = getComputedStyle(element).overflowY;
  return (overflowY === "auto" || overflowY === "scroll") && element.scrollHeight > element.clientHeight + 1;
}

function findScrollable(target: EventTarget | null): HTMLElement | null {
  let element = target instanceof Element ? target : null;
  while (element && element !== document.body) {
    if (element instanceof HTMLElement && isScrollable(element)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

export function installDragScroll(): void {
  let container: HTMLElement | null = null;
  let pointerId = -1;
  let startY = 0;
  let startScrollTop = 0;
  let dragging = false;

  window.addEventListener(
    "pointerdown",
    (event) => {
      dragging = false;
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [data-no-drag-scroll]")) {
        return;
      }
      container = findScrollable(event.target);
      pointerId = event.pointerId;
      startY = event.clientY;
      startScrollTop = container?.scrollTop ?? 0;
    },
    true,
  );

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!container || event.pointerId !== pointerId) {
        return;
      }
      const deltaY = event.clientY - startY;
      if (!dragging && Math.abs(deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }
      dragging = true;
      container.scrollTop = startScrollTop - deltaY;
      event.preventDefault();
    },
    true,
  );

  function end(event: PointerEvent): void {
    if (event.pointerId !== pointerId) {
      return;
    }
    container = null;
    pointerId = -1;
  }
  window.addEventListener("pointerup", end, true);
  window.addEventListener("pointercancel", end, true);

  // A drag that scrolled must not also count as a tap on the button under the finger.
  window.addEventListener(
    "click",
    (event) => {
      if (dragging) {
        dragging = false;
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );
}

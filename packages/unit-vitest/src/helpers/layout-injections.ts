import { vi } from 'vitest';

/**
 * Injections for Components with a QPage root Element
 */
export function qLayoutInjections() {
  return {
    // pageContainerKey
    _q_pc_: true,
    // layoutKey
    _q_l_: {
      header: { size: 0, offset: 0, space: false },
      right: { size: 300, offset: 0, space: false },
      footer: { size: 0, offset: 0, space: false },
      left: { size: 300, offset: 0, space: false },
      isContainer: { value: false },
      view: { value: 'lHh Lpr lff' },
      rows: { value: { top: 'lHh', middle: 'Lpr', bottom: 'lff' } },
      height: { value: 900 },
      instances: {},
      update: vi.fn(),
      animate: vi.fn(),
      totalWidth: { value: 1200 },
      scroll: { value: { position: 0, direction: 'up' } },
      scrollbarWidth: { value: 125 },
    },
  };
}

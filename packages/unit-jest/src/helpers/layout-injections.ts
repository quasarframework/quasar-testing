// TODO: we need the injection keys to be typed and exported from Quasar package

import { jest } from '@jest/globals';
import { ref } from 'vue';

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
      isContainer: ref(false),
      view: ref('lHh Lpr lff'),
      rows: ref({ top: 'lHh', middle: 'Lpr', bottom: 'lff' }),
      height: ref(900),
      instances: {},
      update: jest.fn(),
      animate: jest.fn(),
      totalWidth: ref(1200),
      scroll: ref({ position: 0, direction: 'up' }),
      scrollbarWidth: ref(125),
    },
  };
}

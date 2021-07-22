/**
 * Injections for Components with a QPage root Element
 */
export function qLayoutInjections() {
  return {
    // pageContainerKey
    _q_pc_: true,
    // layoutKey
    _q_l_: {
      header: {},
      right: {},
      footer: {},
      left: {},
      isContainer: { value: false },
    },
  };
}

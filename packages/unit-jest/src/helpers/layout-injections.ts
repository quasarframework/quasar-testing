/**
 * Injections for Components with a QPage root Element
 */
export function qLayoutInjections() {
  return {
    pageContainer: true,
    layout: {
      header: {},
      right: {},
      footer: {},
      left: {},
    },
  };
}

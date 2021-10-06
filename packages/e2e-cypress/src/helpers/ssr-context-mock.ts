export function ssrContextMock() {
  return {
    req: {
      headers: {},
    },
    res: {
      setHeader: () => undefined,
    },
    url: '',
  };
}

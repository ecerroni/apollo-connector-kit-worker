export const useModifiers = model => ({ select = '', lean = true } = {}) =>
  lean ? model.select(select).lean() : model.select(select);

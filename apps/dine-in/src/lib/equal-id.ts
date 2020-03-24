export const isEqualId = (id1: any, id2: any) => {
  if (!id1 || !id2 || !id1.toString || !id2.toString) {
    return false;
  }
  return id1.toString() === id2.toString();
};

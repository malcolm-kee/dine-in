/* istanbul ignore file */

export const createOwnerTestdata = (tableCount: number) => {
  return {
    name: 'Malcolm Cafe',
    username: 'malcolm-kee',
    password: 'abc1234567',
    tables: Array.from({
      length: tableCount,
    }).map((_, index) => ({
      label: `T${index + 1}`,
      numberOfSeat: 5,
    })),
  };
};

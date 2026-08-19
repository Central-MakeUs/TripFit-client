export const getDateKey = (date: Date) => date.toDateString();

export const getMonthSectionId = (year: number, month: number) =>
  `schedule-month-${year}-${month}`;

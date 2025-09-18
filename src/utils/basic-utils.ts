export const getMonthAndYearByDate = (date: Date) => {
  const targetDate = date;
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = targetDate.getFullYear();
  return `${month}-${year}`;
};

export const getCurrentMonthAndYear = () => {
  const targetDate = new Date();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = targetDate.getFullYear();
  return `${month}-${year}`;
};

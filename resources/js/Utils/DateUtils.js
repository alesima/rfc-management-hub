export const handleDaysAgo = (date) => {
  const intervals = [
    { label: "second", ms: 1000 },
    { label: "minute", ms: 1000 * 60 },
    { label: "hour", ms: 1000 * 60 * 60 },
    { label: "day", ms: 1000 * 60 * 60 * 24 },
    { label: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { label: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { label: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  ];

  const elapsed = new Date() - new Date(date);

  const { label, ms } =
    intervals
      .slice()
      .reverse()
      .find((interval) => elapsed >= interval.ms) || intervals[0];

  const count = Math.floor(elapsed / ms);
  return `${count} ${label}${count !== 1 ? "s" : ""} ago`;
};

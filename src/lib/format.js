import { format, parseISO, differenceInCalendarDays } from "date-fns";

export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const dateOnly = (d) => (d ? format(parseISO(d), "d MMM yyyy") : "—");
export const dayMonth = (d) => (d ? format(parseISO(d), "d MMM") : "—");
export const clock = (ts) => (ts ? format(new Date(ts), "HH:mm") : "—");
export const monthLabel = (d) => format(new Date(d), "MMMM yyyy");

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const dayCount = (start, end) =>
  differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

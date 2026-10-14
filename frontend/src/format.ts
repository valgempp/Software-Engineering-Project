const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeZone: 'UTC',
});
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});
const percentFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

/** Date-only ISO string (YYYY-MM-DD): formatted in UTC so that it never shifts by one day. */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatDateTime(isoDateTime: string): string {
  return dateTimeFormat.format(new Date(isoDateTime));
}

export function formatPercent(value: number): string {
  return `${percentFormat.format(value)} %`;
}

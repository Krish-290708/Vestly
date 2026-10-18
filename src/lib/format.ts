/**
 * Vestly Formatting Library ("The Ledger" Design System)
 * Strictly follows Section C6 copy rules:
 * - Dates look like "18 Oct 2026"
 * - Money has no decimals unless under $100
 * - relativeDays(): "in 14 days", "3 days ago"
 * - signedMoney(): explicit sign (+ or -)
 */

export interface MoneyOptions {
  showCents?: boolean;
}

/**
 * Formats a monetary amount in USD:
 * - Under $100 (and non-zero) includes 2 decimal places (e.g. "$25.50", "$0.50")
 * - $100 and above has no decimals unless showCents is explicitly true (e.g. "$1,200")
 * - Negative amounts are prefixed with a minus sign (e.g. "-$1,200")
 */
export function money(amount: number, options?: MoneyOptions): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return '$0';
  }

  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted: string;
  const needCents = options?.showCents ?? (abs > 0 && abs < 100);

  if (needCents) {
    formatted = abs.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = Math.round(abs).toLocaleString('en-US');
  }

  return `${isNegative ? '-' : ''}$${formatted}`;
}

/**
 * Compact financial figures: $1.2B, $43M, $500K, $25K, $50
 */
export function compactMoney(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return '$0';
  }

  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const sign = isNegative ? '-' : '';

  if (abs >= 1e12) {
    const val = abs / 1e12;
    return `${sign}$${cleanTrailingZero(val.toFixed(val >= 10 ? 1 : 2))}T`;
  }
  if (abs >= 1e9) {
    const val = abs / 1e9;
    return `${sign}$${cleanTrailingZero(val.toFixed(val >= 10 ? 1 : 2))}B`;
  }
  if (abs >= 1e6) {
    const val = abs / 1e6;
    return `${sign}$${cleanTrailingZero(val.toFixed(val >= 10 ? 1 : 1))}M`;
  }
  if (abs >= 1e3) {
    const val = abs / 1e3;
    return `${sign}$${cleanTrailingZero(val.toFixed(val >= 100 ? 0 : 1))}K`;
  }

  return money(amount);
}

function cleanTrailingZero(str: string): string {
  return str.replace(/\.0+$/, '').replace(/(\.[0-9])0+$/, '$1');
}

/**
 * Formats equity units / shares with commas: "1,200", "10,000"
 */
export function units(count: number): string {
  if (typeof count !== 'number' || isNaN(count) || !isFinite(count)) {
    return '0';
  }
  return Math.round(count).toLocaleString('en-US');
}

/**
 * Formats a percentage: "25%", "25.5%"
 * If isDecimal is true, 0.25 -> "25%"
 */
export function percent(val: number, isDecimal: boolean = false, maxDecimals: number = 1): string {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return '0%';
  }
  const pct = isDecimal ? val * 100 : val;
  const formatted = cleanTrailingZero(pct.toFixed(maxDecimals));
  return `${formatted}%`;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats a date strictly as "18 Oct 2026"
 */
export function date(d: Date | string | number): string {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (!dateObj || isNaN(dateObj.getTime())) {
    return '';
  }

  // Use local date parts
  const day = dateObj.getDate();
  const month = MONTH_NAMES[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Computes calendar day difference relative to asOfDate:
 * - "today"
 * - "in 1 day", "in 14 days"
 * - "1 day ago", "3 days ago"
 */
export function relativeDays(targetDate: Date | string | number, asOfDate: Date = new Date()): string {
  const target = typeof targetDate === 'string' || typeof targetDate === 'number' ? new Date(targetDate) : targetDate;
  if (!target || isNaN(target.getTime())) {
    return '';
  }

  // Normalize to calendar day midnights (UTC or local) to avoid hour/minute shifts
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const asOfMidnight = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate()).getTime();

  const diffMs = targetMidnight - asOfMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  }
  if (diffDays === 1) {
    return 'in 1 day';
  }
  if (diffDays > 1) {
    return `in ${diffDays} days`;
  }
  if (diffDays === -1) {
    return '1 day ago';
  }
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Formats money with an explicit sign (+ or -):
 * - "+$1,200"
 * - "-$1,200"
 * - "$0"
 */
export function signedMoney(amount: number, options?: MoneyOptions): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount === 0) {
    return '$0';
  }

  if (amount > 0) {
    return `+${money(amount, options)}`;
  }
  return money(amount, options);
}


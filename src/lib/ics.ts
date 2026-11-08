/**
 * Generates an RFC 5545 iCalendar (.ics) string from an array of actions.
 * Each action becomes a VEVENT with a full-day DTSTART.
 */

interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  urgency?: string;
}

function icsDateStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsDateOnly(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateIcs(events: IcsEvent[]): string {
  const now = icsDateStamp(new Date());

  const vevents = events.map((ev) => {
    const lines = [
      'BEGIN:VEVENT',
      `UID:${ev.uid}@vestly`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${icsDateOnly(ev.dueDate)}`,
      `SUMMARY:${escapeIcs(ev.title)}`,
    ];

    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeIcs(ev.description)}`);
    }

    if (ev.urgency === 'CRITICAL' || ev.urgency === 'HIGH') {
      lines.push('PRIORITY:1');
    }

    lines.push('END:VEVENT');
    return lines.join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vestly//Equity Actions//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(events: IcsEvent[], filename = 'vestly-actions.ics') {
  const icsContent = generateIcs(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


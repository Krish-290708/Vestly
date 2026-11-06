import { describe, it, expect } from 'vitest';
import { generateIcs } from '../src/lib/ics';

describe('ICS export', () => {
  it('generates valid RFC 5545 iCalendar output', () => {
    const events = [
      {
        uid: 'test-1',
        title: 'Review vesting milestone',
        description: 'ISO grant vesting tranche',
        dueDate: '2026-03-15T00:00:00Z',
        urgency: 'HIGH',
      },
      {
        uid: 'test-2',
        title: 'File 83(b) election',
        dueDate: '2026-04-01T00:00:00Z',
        urgency: 'CRITICAL',
      },
    ];

    const ics = generateIcs(events);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Vestly//Equity Actions//EN');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('UID:test-1@vestly');
    expect(ics).toContain('SUMMARY:Review vesting milestone');
    expect(ics).toContain('DESCRIPTION:ISO grant vesting tranche');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260315');
    expect(ics).toContain('UID:test-2@vestly');
    expect(ics).toContain('SUMMARY:File 83(b) election');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260401');
    // HIGH and CRITICAL set priority 1
    expect(ics).toContain('PRIORITY:1');
  });

  it('escapes special characters in title and description', () => {
    const events = [
      {
        uid: 'test-3',
        title: 'Meeting, review; options',
        description: 'Line 1\nLine 2',
        dueDate: '2026-06-01T00:00:00Z',
      },
    ];

    const ics = generateIcs(events);

    expect(ics).toContain('SUMMARY:Meeting\\, review\\; options');
    expect(ics).toContain('DESCRIPTION:Line 1\\nLine 2');
  });

  it('produces two VEVENT blocks for two events', () => {
    const events = [
      { uid: 'a', title: 'First', dueDate: '2026-01-01T00:00:00Z' },
      { uid: 'b', title: 'Second', dueDate: '2026-02-01T00:00:00Z' },
    ];

    const ics = generateIcs(events);
    const vevents = ics.split('BEGIN:VEVENT').length - 1;
    expect(vevents).toBe(2);
  });
});


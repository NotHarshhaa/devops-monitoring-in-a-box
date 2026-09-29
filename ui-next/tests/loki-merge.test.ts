import { describe, expect, it } from 'vitest';
import { LokiAPI, type LokiLogEntry } from '../lib/loki-api';

function entry(timestamp: string, line: string): LokiLogEntry {
  return { timestamp, line, labels: { job: 'test' } };
}

describe('LokiAPI.mergeLogEntries', () => {
  it('prepends incoming entries (newest first) ahead of existing ones', () => {
    const existing = [entry('200', 'old'), entry('100', 'older')];
    const incoming = [entry('400', 'new'), entry('300', 'newer')];

    const merged = LokiAPI.mergeLogEntries(existing, incoming);

    expect(merged.map((e) => e.timestamp)).toEqual(['400', '300', '200', '100']);
  });

  it('deduplicates entries with identical timestamp and line', () => {
    const existing = [entry('200', 'dup'), entry('100', 'older')];
    const incoming = [entry('200', 'dup'), entry('300', 'new')];

    const merged = LokiAPI.mergeLogEntries(existing, incoming);

    expect(merged).toHaveLength(3);
    expect(merged.map((e) => e.timestamp)).toEqual(['300', '200', '100']);
  });

  it('caps the merged list at the limit, keeping the newest entries', () => {
    const existing = [entry('200', 'a'), entry('100', 'b')];
    const incoming = [entry('400', 'c'), entry('300', 'd')];

    const merged = LokiAPI.mergeLogEntries(existing, incoming, 2);

    expect(merged.map((e) => e.timestamp)).toEqual(['400', '300']);
  });

  it('handles empty incoming or existing lists', () => {
    expect(LokiAPI.mergeLogEntries([], [entry('100', 'x')])).toHaveLength(1);
    expect(LokiAPI.mergeLogEntries([entry('100', 'x')], [])).toHaveLength(1);
    expect(LokiAPI.mergeLogEntries([], [])).toHaveLength(0);
  });
});


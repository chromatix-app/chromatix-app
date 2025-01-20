import moment from 'moment';

import addedAtToString from './addedAtToString';

const now = moment();
const nowInSeconds = now.unix();

describe('Testing "addedAtToString" function', () => {
  test('Test simple duration results', () => {
    expect(addedAtToString(nowInSeconds - 30)).toBe('0 minutes ago');

    expect(addedAtToString(nowInSeconds - 59)).toBe('0 minutes ago');
    expect(addedAtToString(nowInSeconds - 60)).toBe('1 minute ago');

    expect(addedAtToString(nowInSeconds - 119)).toBe('1 minute ago');
    expect(addedAtToString(nowInSeconds - 120)).toBe('2 minutes ago');

    expect(addedAtToString(nowInSeconds - 299)).toBe('4 minutes ago');
    expect(addedAtToString(nowInSeconds - 300)).toBe('5 minutes ago');

    expect(addedAtToString(nowInSeconds - 599)).toBe('9 minutes ago');
    expect(addedAtToString(nowInSeconds - 600)).toBe('10 minutes ago');

    expect(addedAtToString(nowInSeconds - 1499)).toBe('24 minutes ago');
    expect(addedAtToString(nowInSeconds - 1500)).toBe('25 minutes ago');

    expect(addedAtToString(nowInSeconds - 3599)).toBe('59 minutes ago');
    expect(addedAtToString(nowInSeconds - 3600)).toBe('1 hour ago');

    expect(addedAtToString(nowInSeconds - 7199)).toBe('1 hour ago');
    expect(addedAtToString(nowInSeconds - 7200)).toBe('2 hours ago');

    expect(addedAtToString(nowInSeconds - 21599)).toBe('5 hours ago');
    expect(addedAtToString(nowInSeconds - 21600)).toBe('6 hours ago');

    expect(addedAtToString(nowInSeconds - 86399)).toBe('23 hours ago');
    expect(addedAtToString(nowInSeconds - 86400)).toBe('1 day ago');

    expect(addedAtToString(nowInSeconds - 604799)).toBe('6 days ago');
    expect(addedAtToString(nowInSeconds - 604800)).toBe('1 week ago');

    expect(addedAtToString(nowInSeconds - 2419199)).toBe('3 weeks ago');

    expect(addedAtToString(1734450079)).toBe('17 Dec 2024');
    expect(addedAtToString(1733450079)).toBe('6 Dec 2024');
    expect(addedAtToString(1723450079)).toBe('12 Aug 2024');
    expect(addedAtToString(1623450079)).toBe('11 Jun 2021');

    expect(addedAtToString(0)).toBe('1 Jan 1970');
  });
});

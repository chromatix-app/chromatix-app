import moment from 'moment';

import formatRecentDate from './formatRecentDate';

const now = moment();
const nowInSeconds = now.unix();

describe('Testing "formatRecentDate" function', () => {
  test('Test simple duration results', () => {
    expect(formatRecentDate(nowInSeconds - 30)).toBe('a few seconds ago');

    expect(formatRecentDate(nowInSeconds - 59)).toBe('a minute ago');
    expect(formatRecentDate(nowInSeconds - 60)).toBe('a minute ago');

    expect(formatRecentDate(nowInSeconds - 119)).toBe('2 minutes ago');
    expect(formatRecentDate(nowInSeconds - 120)).toBe('2 minutes ago');

    expect(formatRecentDate(nowInSeconds - 299)).toBe('5 minutes ago');
    expect(formatRecentDate(nowInSeconds - 300)).toBe('5 minutes ago');

    expect(formatRecentDate(nowInSeconds - 599)).toBe('10 minutes ago');
    expect(formatRecentDate(nowInSeconds - 600)).toBe('10 minutes ago');

    expect(formatRecentDate(nowInSeconds - 1499)).toBe('25 minutes ago');
    expect(formatRecentDate(nowInSeconds - 1500)).toBe('25 minutes ago');

    expect(formatRecentDate(nowInSeconds - 3599)).toBe('an hour ago');
    expect(formatRecentDate(nowInSeconds - 3600)).toBe('an hour ago');

    expect(formatRecentDate(nowInSeconds - 7199)).toBe('2 hours ago');
    expect(formatRecentDate(nowInSeconds - 7200)).toBe('2 hours ago');

    expect(formatRecentDate(nowInSeconds - 21599)).toBe('6 hours ago');
    expect(formatRecentDate(nowInSeconds - 21600)).toBe('6 hours ago');

    expect(formatRecentDate(nowInSeconds - 86399)).toBe('a day ago');
    expect(formatRecentDate(nowInSeconds - 86400)).toBe('a day ago');

    expect(formatRecentDate(nowInSeconds - 604799)).toBe('7 days ago');
    expect(formatRecentDate(nowInSeconds - 604800)).toBe('7 days ago');

    expect(formatRecentDate(nowInSeconds - 604799)).toBe('7 days ago');
    expect(formatRecentDate(nowInSeconds - 604800)).toBe('7 days ago');

    expect(formatRecentDate(nowInSeconds - 691199)).toBe('8 days ago');
    expect(formatRecentDate(nowInSeconds - 691200)).toBe('8 days ago');

    expect(formatRecentDate(nowInSeconds - 863999)).toBe('10 days ago');
    expect(formatRecentDate(nowInSeconds - 864000)).toBe('10 days ago');

    expect(formatRecentDate(nowInSeconds - 1727000)).toBe('20 days ago');
    expect(formatRecentDate(nowInSeconds - 1728000)).toBe('20 days ago');

    expect(formatRecentDate(nowInSeconds - 2419200)).toBe('a month ago');

    expect(formatRecentDate(nowInSeconds - 15778476)).toBe('6 months ago');

    expect(formatRecentDate(nowInSeconds - 31556952)).toBe('a year ago');

    expect(formatRecentDate(nowInSeconds - 315569520)).toBe('10 years ago');

    expect(formatRecentDate(nowInSeconds - 3155695200)).toBe('100 years ago');

    // expect(formatRecentDate(1734450079)).toBe('17 Dec 2024');
    // expect(formatRecentDate(1733450079)).toBe('6 Dec 2024');
    // expect(formatRecentDate(1723450079)).toBe('12 Aug 2024');
    // expect(formatRecentDate(1623450079)).toBe('11 Jun 2021');

    // expect(formatRecentDate(0)).toBe('1 Jan 1970');
  });
});

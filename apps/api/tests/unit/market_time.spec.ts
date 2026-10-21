import { test } from '@japa/runner'
import {
  formatMarketTime,
  fromPickerValue,
  getMarket,
  marketDateTime,
  marketParts,
  toPickerValue,
} from '@a2b/core'

const UG = getMarket('UG') // UTC+3
const GY = getMarket('GY') // UTC−4

test.group('Market time', () => {
  test('shows a moment on each market’s clock', ({ assert }) => {
    const moment = '2026-10-21T05:00:00Z'
    assert.equal(formatMarketTime(moment, UG, 'time'), '8:00 am')
    assert.equal(formatMarketTime(moment, GY, 'time'), '1:00 am')
    assert.equal(formatMarketTime('2026-10-21T02:30:00Z', GY, 'dateTime'), '20 Oct, 10:30 pm') // the day before
    assert.equal(
      formatMarketTime('2026-10-20T21:15:00Z', UG, 'weekdayDateTime'),
      'Wed 21 Oct, 12:15 am'
    )
    assert.equal(formatMarketTime(null, UG), '—')
  })

  test('a wall-clock time in the market becomes the right moment', ({ assert }) => {
    // 8 am on 22 Oct in Kampala is 05:00 UTC; in Georgetown, 12:00 UTC
    assert.equal(marketDateTime(UG, 2026, 9, 22, 8).toISOString(), '2026-10-22T05:00:00.000Z')
    assert.equal(marketDateTime(GY, 2026, 9, 22, 8).toISOString(), '2026-10-22T12:00:00.000Z')
    assert.deepInclude(marketParts(marketDateTime(GY, 2026, 0, 1, 0, 5), GY), {
      year: 2026,
      month: 0,
      day: 1,
      hour: 0,
      minute: 5,
    })
  })

  test('picker values round-trip whatever the phone’s timezone', ({ assert }) => {
    // The picker shows 17:00 on 23 Oct on the phone's clock: that means 17:00 in the market
    const picked = new Date(2026, 9, 23, 17, 0)
    const deadline = fromPickerValue(picked, UG)
    assert.equal(deadline.toISOString(), '2026-10-23T14:00:00.000Z')
    assert.equal(toPickerValue(deadline, UG).getTime(), picked.getTime())
  })
})

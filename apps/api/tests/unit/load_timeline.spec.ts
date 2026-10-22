import { test } from '@japa/runner'
import { loadTimeline, type TimelineLoad } from '@a2b/core'

const blank: TimelineLoad = {
  status: 'DRAFT',
  postedAt: null,
  matchedAt: null,
  securedAt: null,
  inTransitAt: null,
  deliveredAt: null,
  completedAt: null,
  cancelledAt: null,
}

test.group('Load timeline', () => {
  test('marks what happened, what it waits on, and what is ahead', ({ assert }) => {
    const steps = loadTimeline(
      {
        ...blank,
        status: 'SECURED',
        postedAt: '2026-10-20T08:00:00Z',
        matchedAt: '2026-10-20T09:00:00Z',
        securedAt: '2026-10-20T09:30:00Z',
      },
      [
        { fromStatus: 'DRAFT', toStatus: 'OPEN', note: null },
        { fromStatus: 'OPEN', toStatus: 'MATCHED', note: null },
        { fromStatus: 'MATCHED', toStatus: 'MATCHED', note: 'Assigned to Sarah (UAM 456K)' },
        { fromStatus: 'MATCHED', toStatus: 'SECURED', note: 'Escrow funded via mtn' },
      ]
    )
    assert.deepEqual(
      steps.map((s) => s.state),
      ['done', 'done', 'done', 'active', 'pending', 'pending']
    )
    assert.deepEqual(steps[1].notes, ['Assigned to Sarah (UAM 456K)'])
    assert.deepEqual(steps[2].notes, ['Escrow funded via mtn'])
    assert.equal(steps[2].at, '2026-10-20T09:30:00Z')
    assert.deepEqual(steps[3].notes, ['Driver heading to pickup'])
    assert.isNull(steps[4].at)
  })

  test('a re-match shows the latest carrier, not the one who withdrew', ({ assert }) => {
    const steps = loadTimeline({ ...blank, status: 'MATCHED', postedAt: 'a', matchedAt: 'b' }, [
      { fromStatus: 'OPEN', toStatus: 'MATCHED', note: 'first carrier' },
      { fromStatus: 'MATCHED', toStatus: 'OPEN', note: 'Carrier withdrew' },
      { fromStatus: 'OPEN', toStatus: 'MATCHED', note: 'second carrier' },
    ])
    assert.deepEqual(steps[1].notes, ['second carrier'])
  })

  test('a cancelled load shows the steps it reached, then the cancellation', ({ assert }) => {
    const steps = loadTimeline(
      {
        ...blank,
        status: 'CANCELLED',
        postedAt: 'a',
        matchedAt: 'b',
        securedAt: 'c',
        cancelledAt: 'd',
      },
      [{ fromStatus: 'SECURED', toStatus: 'CANCELLED', note: 'Escrow refunded to the shipper' }]
    )
    assert.deepEqual(
      steps.map((s) => s.status),
      ['OPEN', 'MATCHED', 'SECURED', 'CANCELLED']
    )
    assert.deepEqual(steps.at(-1)!.notes, ['Escrow refunded to the shipper'])
  })

  test('a draft is waiting to be posted', ({ assert }) => {
    const [first] = loadTimeline(blank)
    assert.equal(first.state, 'active')
    assert.deepEqual(first.notes, ['Not posted yet'])
  })

  test('words what it waits on for whoever is reading', ({ assert }) => {
    const delivered: TimelineLoad = {
      ...blank,
      status: 'DELIVERED',
      postedAt: '2026-10-20T08:00:00Z',
      matchedAt: '2026-10-20T09:00:00Z',
      securedAt: '2026-10-20T09:30:00Z',
      inTransitAt: '2026-10-20T11:00:00Z',
      deliveredAt: '2026-10-20T15:00:00Z',
    }
    const next = (audience?: 'shipper' | 'fleet' | 'driver') =>
      loadTimeline(delivered, [], audience).find((s) => s.state === 'active')?.notes
    assert.deepEqual(next(), ['Waiting for your release code'])
    assert.deepEqual(next('fleet'), ["Waiting for the shipper's release code"])
    assert.deepEqual(next('driver'), ["Enter the shipper's release code"])

    const secured = loadTimeline({ ...delivered, status: 'SECURED' }, [], 'fleet')
    assert.deepEqual(secured.find((s) => s.state === 'active')?.notes, ['Driver heading to pickup'])
  })
})

import { test, expect, type Page } from '@playwright/test'

const installDeterministicRandom = async (page: Page) => {
  await page.addInitScript(() => {
    let calls = 0
    Math.random = () => {
      calls += 1
      return (calls % 10) / 10
    }
  })
}

const installAcceleratedIntervals = async (page: Page, speedMultiplier = 50) => {
  await page.addInitScript((multiplier: number) => {
    const originalSetInterval = window.setInterval
    const SPEED_MULTIPLIER = multiplier

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window.setInterval as any) = (
      handler: TimerHandler,
      _timeout?: number,
      ...args: unknown[]
    ) => {
      const callback = typeof handler === 'function' ? handler : () => {}

      return originalSetInterval(() => {
        for (let i = 0; i < SPEED_MULTIPLIER; i += 1) {
          callback(...args)
        }
      }, 1)
    }
  }, speedMultiplier)
}

const waitForLaneToStabilize = async (page: Page, selector: string, stableMs = 150) => {
  await page.waitForFunction(
    ({ selector, stableMs }) => {
      const element = document.querySelector(selector)
      if (!element || !(element instanceof HTMLElement)) return false

      const current = element.style.left
      const key = '__aqaLaneStable'
      const now = performance.now()
      const state = (
        window as unknown as { [key: string]: Record<string, { value: string; since: number }> }
      )[key]

      if (!state) {
        ;(window as unknown as { [key: string]: Record<string, { value: string; since: number }> })[
          key
        ] = {
          [selector]: { value: current, since: now },
        }
        return false
      }

      const entry = state[selector]
      if (!entry || entry.value !== current) {
        state[selector] = { value: current, since: now }
        return false
      }

      return now - entry.since >= stableMs
    },
    { selector, stableMs },
  )
}

test('starts a session and renders horses and rounds', async ({ page }) => {
  const apiRequests: string[] = []

  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api')) {
      apiRequests.push(request.url())
    }
  })

  await installDeterministicRandom(page)

  await page.goto('/')

  await page.locator('[data-aqa="generate-program"]').click()

  const horseRows = page.locator('[data-aqa="horse-list"]').locator('[data-aqa="horse-row"]')
  await expect(horseRows).toHaveCount(20)

  const programRoot = page.locator('[data-aqa="race-program"]')
  const programItems = programRoot.locator('[data-aqa="race-round"]')
  await expect(programItems).toHaveCount(6)

  const distances = ['1200m', '1400m', '1600m', '1800m', '2000m', '2200m']
  for (const distance of distances) {
    await expect(programRoot.getByText(distance, { exact: true })).toBeVisible()
  }

  expect(apiRequests).toEqual([])
})

test('runs a round with pause/resume and auto-starts the next round', async ({ page }) => {
  await installDeterministicRandom(page)
  await installAcceleratedIntervals(page)

  await page.goto('/')

  await page.locator('[data-aqa="generate-program"]').click()

  const startStop = page.locator('[data-aqa="start-stop"]')
  const laneSelector = '[data-aqa="race-lane"][data-lane-number="1"] div[style*="left"]'

  const getLaneLeft = async () => {
    return page
      .locator(laneSelector)
      .evaluate((el) => (el instanceof HTMLElement ? el.style.left : ''))
  }

  const leftBeforeStart = await getLaneLeft()

  await startStop.click()

  await page.waitForFunction(
    ({ selector, previous }) => {
      const element = document.querySelector(selector)
      if (!element || !(element instanceof HTMLElement)) return false
      return element.style.left !== previous
    },
    { selector: laneSelector, previous: leftBeforeStart },
  )

  await startStop.click()

  const leftPaused = await getLaneLeft()
  await waitForLaneToStabilize(page, laneSelector)

  const leftAfterPause = await getLaneLeft()
  expect(leftAfterPause).toBe(leftPaused)

  await startStop.click()

  await page.waitForFunction(
    ({ selector, previous }) => {
      const element = document.querySelector(selector)
      if (!element || !(element instanceof HTMLElement)) return false
      return element.style.left !== previous
    },
    { selector: laneSelector, previous: leftPaused },
  )

  const raceTrack = page.locator('[data-aqa="race-track"]')
  await expect(raceTrack).toContainText('Round 2', { timeout: 15000 })
})

test('completes a full session and resets on regenerate', async ({ page }) => {
  test.setTimeout(90000)
  await installDeterministicRandom(page)

  await page.goto('/')

  await page.locator('[data-aqa="generate-program"]').click()

  const startStop = page.locator('[data-aqa="start-stop"]')
  const nextRound = page.getByRole('button', { name: 'Next Round' })
  const raceTrack = page.locator('[data-aqa="race-track"]')

  await startStop.click()

  await expect(startStop).toContainText('Pause')

  for (let round = 1; round <= 5; round += 1) {
    await nextRound.click()
    await expect(raceTrack).toContainText(`Round ${round + 1}`)
    await expect(startStop).toContainText('Pause')
  }

  await nextRound.click()

  await expect(startStop).toContainText('Finished', { timeout: 10000 })
  await expect(startStop).toBeDisabled()

  const programRoot = page.locator('[data-aqa="race-program"]')
  const roundSix = programRoot.locator('[data-aqa="race-round"]', { hasText: 'Round 6' })

  await roundSix.locator('[data-slot="accordion-trigger"]').click()

  const roundSixParticipants = roundSix
    .locator('[data-aqa="round-participants"]')
    .locator('[data-aqa="participant-row"]')

  await expect(roundSixParticipants).toHaveCount(10)

  await page.locator('[data-aqa="generate-program"]').click()

  await expect(startStop).toContainText('Start', { timeout: 10000 })
  await expect(raceTrack).toContainText('Round 1')
})

test('regenerates the program during a paused round', async ({ page }) => {
  await installDeterministicRandom(page)

  await page.goto('/')

  await page.locator('[data-aqa="generate-program"]').click()

  const startStop = page.locator('[data-aqa="start-stop"]')
  const laneSelector = '[data-aqa="race-lane"][data-lane-number="1"] div[style*="left"]'

  const getLaneLeft = async () => {
    return page
      .locator(laneSelector)
      .evaluate((el) => (el instanceof HTMLElement ? el.style.left : ''))
  }

  const leftBeforeStart = await getLaneLeft()

  await startStop.click()

  await page.waitForFunction(
    ({ selector, previous }) => {
      const element = document.querySelector(selector)
      if (!element || !(element instanceof HTMLElement)) return false
      return element.style.left !== previous
    },
    { selector: laneSelector, previous: leftBeforeStart },
  )

  await startStop.click()

  const leftPaused = await getLaneLeft()
  await waitForLaneToStabilize(page, laneSelector)
  const leftAfterPause = await getLaneLeft()
  expect(leftAfterPause).toBe(leftPaused)

  await page.locator('[data-aqa="generate-program"]').click()

  await expect(startStop).toContainText('Start', { timeout: 10000 })
  await expect(page.locator('[data-aqa="race-track"]')).toContainText('Round 1')

  const horseRows = page.locator('[data-aqa="horse-list"]').locator('[data-aqa="horse-row"]')
  await expect(horseRows).toHaveCount(20)

  const programItems = page.locator('[data-aqa="race-program"]').locator('[data-aqa="race-round"]')
  await expect(programItems).toHaveCount(6)
})

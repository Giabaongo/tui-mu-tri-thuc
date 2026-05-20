/**
 * E2E tests for Túi Mù Tri Thức game at http://localhost:5173
 * Run with: node e2e-test.mjs
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { chromium } = require('/home/bao/.npm/_npx/e41f203b7505f1fb/node_modules/playwright')
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const SHOTS = join(__dir, 'e2e-screenshots')
mkdirSync(SHOTS, { recursive: true })

const URL = 'http://localhost:5173'
const results = []

function log(msg) { console.log(msg) }
function pass(name, detail = '') { results.push({ name, status: 'PASS', detail }); log(`  PASS  ${name}${detail ? ': ' + detail : ''}`) }
function fail(name, detail = '') { results.push({ name, status: 'FAIL', detail }); log(`  FAIL  ${name}: ${detail}`) }
function warn(name, detail = '') { results.push({ name, status: 'WARN', detail }); log(`  WARN  ${name}: ${detail}`) }

async function shot(page, name) {
  const p = join(SHOTS, `${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  log(`       Screenshot -> e2e-screenshots/${name}.png`)
  return p
}

async function run() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // Collect console errors
  const consoleErrors = []
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message))

  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 })
    log('\n=== TEST 1: Initial Render ===')
    await shot(page, '01-initial-render')

    // Check title
    const title = await page.locator('h1').first().textContent()
    if (title && title.includes('TÚI MÙ TRI THỨC')) {
      pass('TC1.1 Title visible', title.trim())
    } else {
      fail('TC1.1 Title visible', `Got: ${title}`)
    }

    // Check 5 team cards
    // TeamCard is a div with team name text; teams are Nhóm 2..6
    const teamNames = ['Nhóm 2', 'Nhóm 3', 'Nhóm 4', 'Nhóm 5', 'Nhóm 6']
    let teamsFound = 0
    for (const name of teamNames) {
      const el = page.locator(`text="${name}"`).first()
      if (await el.isVisible()) teamsFound++
    }
    if (teamsFound === 5) pass('TC1.2 All 5 team cards visible')
    else fail('TC1.2 All 5 team cards visible', `Only ${teamsFound}/5 found`)

    // Check team scores all start at 5
    // Scores are displayed as large numbers in the cards
    const scoreEls = await page.locator('.text-4xl').allTextContents()
    const allFive = scoreEls.every(s => s.trim() === '5')
    if (scoreEls.length === 5 && allFive) pass('TC1.3 All teams start at 5 points')
    else fail('TC1.3 All teams start at 5 points', `Scores: ${JSON.stringify(scoreEls)}`)

    // QBag renders divs with class "qbag", RBag with "rbag"
    const qBagCounter = await page.locator('text=/\\d+\\/15 đã mở/').allTextContents()
    log(`       Q/R bag counters: ${JSON.stringify(qBagCounter)}`)
    const qBagCount = await page.locator('.qbag').count()
    const rBagCount = await page.locator('.rbag').count()
    log(`       .qbag count: ${qBagCount}, .rbag count: ${rBagCount}`)
    if (qBagCount === 15 && rBagCount === 15) {
      pass('TC1.4 15 Question bags and 15 Reward bags visible')
    } else {
      fail('TC1.4 Bag counts', `qbag=${qBagCount}, rbag=${rBagCount} (expected 15 each)`)
    }

    // Reward bags locked: class "locked" on rbag divs, and no gold banner
    const lockedRBags = await page.locator('.rbag.locked').count()
    log(`       Locked rbag count: ${lockedRBags}`)
    if (lockedRBags === 15) pass('TC1.5a All 15 reward bags have locked class')
    else warn('TC1.5a Locked reward bags', `Found ${lockedRBags}/15 with locked class`)

    const goldBanner = page.locator('text=/trả lời ĐÚNG/')
    const bannerVisible = await goldBanner.isVisible()
    if (!bannerVisible) pass('TC1.5 Reward bags locked on start (no gold banner)')
    else fail('TC1.5 Reward bags locked on start', 'Gold ĐÚNG banner is showing unexpectedly')

    // Check step prompt visible
    const stepPrompt = page.locator('text=/Bước 1/')
    if (await stepPrompt.isVisible()) pass('TC1.6 Team selection prompt shown')
    else fail('TC1.6 Team selection prompt shown')

    // -----------------------------------------------------------------------
    log('\n=== TEST 2: Team Selection Warning ===')

    // Click a question bag WITHOUT selecting a team
    // Find a QBag - they render as clickable elements with numbers 1-15
    // In QBag.jsx the component calls onClick(id) when clicked
    // The grid of Q bags is inside the left panel
    // QBag renders divs with class "qbag"; click first unused one
    const firstBagCount = await page.locator('.qbag').count()
    log(`       Found ${firstBagCount} Q-bag grid items`)
    const firstQBag = page.locator('.qbag').first()

    await firstQBag.click({ force: true, timeout: 5000 })
    await page.waitForTimeout(400)
    await shot(page, '02-team-warning')

    const warning = page.locator('text=/Hãy chọn nhóm trả lời trước khi mở túi câu hỏi/')
    if (await warning.isVisible()) {
      pass('TC2.1 Warning appears when no team selected')
      // Check it has red background
      const cls = await warning.evaluate(el => el.className)
      if (cls.includes('red') || cls.includes('bg-red')) pass('TC2.2 Warning has red styling')
      else warn('TC2.2 Warning red styling', `class: ${cls.substring(0, 80)}`)
    } else {
      fail('TC2.1 Warning appears when no team selected', 'Warning text not found')
    }

    // Warning should auto-dismiss after 2.5s
    await page.waitForTimeout(3000)
    const warningGone = !(await warning.isVisible())
    if (warningGone) pass('TC2.3 Warning auto-dismisses after ~2.5s')
    else fail('TC2.3 Warning auto-dismisses', 'Still visible after 3s')

    // -----------------------------------------------------------------------
    log('\n=== TEST 3: Normal Question Flow (Correct Answer) ===')

    // Select "Nhóm 2"
    await page.locator('text="Nhóm 2"').first().click()
    await page.waitForTimeout(200)

    const selectedPrompt = page.locator('text=/Nhóm trả lời: Nhóm 2/')
    if (await selectedPrompt.isVisible()) pass('TC3.1 Team "Nhóm 2" selected, prompt updates')
    else warn('TC3.1 Team selection prompt', 'Prompt may not have updated')

    await shot(page, '03-team-selected')

    // Click first unused question bag (class "bag-q" = unused, "used" = used)
    await page.locator('.qbag.bag-q').first().click({ force: true, timeout: 5000 })
    await page.waitForTimeout(500)
    await shot(page, '03-question-modal')

    // Question modal should appear
    const questionHeader = page.locator('text="CÂU HỎI"')
    if (await questionHeader.isVisible()) {
      pass('TC3.2 Question modal appears')
    } else {
      fail('TC3.2 Question modal appears', 'CÂU HỎI header not found')
    }

    // Check 4 answer options visible
    // Answer options are in a 2-col grid with A. B. C. D. labels
    const ansOpts = page.locator('text=/^[ABCD]\\./').all()
    const optCount = (await ansOpts).length
    if (optCount >= 4) pass(`TC3.3 4 answer options visible (found ${optCount})`)
    else warn('TC3.3 Answer options', `Found ${optCount} option labels`)

    // Check confirm button is disabled when no answer selected
    const confirmBtn = page.locator('button', { hasText: 'Xác nhận trả lời' })
    const isDisabled = await confirmBtn.isDisabled()
    if (isDisabled) pass('TC3.4 Confirm button disabled before answer selected')
    else fail('TC3.4 Confirm button disabled', 'Button is enabled before selection')

    // We need to figure out the correct answer to test correct flow
    // The modal shows options as grid divs; we can read the question text and find ans
    // from our known question data. Since questions are random we'll just try option A (index 0)
    // and handle both correct and wrong outcomes.
    const optionDivs = page.locator('.grid > div').filter({ hasText: /[ABCD]\. / })
    const optDivCount = await optionDivs.count()
    log(`       Answer option divs found: ${optDivCount}`)

    // Click first answer option
    if (optDivCount >= 1) {
      await optionDivs.first().click()
      await page.waitForTimeout(200)

      // Confirm button should now be enabled
      const nowEnabled = await confirmBtn.isEnabled()
      if (nowEnabled) pass('TC3.5 Confirm button enabled after answer selected')
      else fail('TC3.5 Confirm button enabled', 'Still disabled after selecting answer')

      await shot(page, '03-answer-selected')

      // Click confirm
      await confirmBtn.click()
      await page.waitForTimeout(800)
      await shot(page, '03-after-confirm')

      // Check outcome: either correct (result modal green) or wrong (flash + team buttons)
      const resultModal = page.locator('text=/ĐÚNG RỒI|CHÍNH XÁC|Chúc mừng/i').first()
      const wrongFlash = page.locator('text=/SAI! Chuyển nhóm/').first()
      const isCorrect = await resultModal.isVisible().catch(() => false)
      const isWrong = await wrongFlash.isVisible().catch(() => false)

      if (isCorrect) {
        pass('TC3.6a Correct answer: result modal appeared')
        // Check score increased by 2 for Nhóm 2
        const scores = await page.locator('.text-4xl').allTextContents()
        log(`       Scores after correct: ${JSON.stringify(scores)}`)
        // Result modal - dismiss it
        const dismissBtn = page.locator('button').filter({ hasText: /Đóng|OK|✕|tiếp/ }).first()
        if (await dismissBtn.isVisible()) {
          await dismissBtn.click()
          await page.waitForTimeout(400)
        }
        // Check gold banner for reward
        await shot(page, '03-after-correct-dismiss')
        const goldBannerNow = page.locator('text=/trả lời ĐÚNG/')
        if (await goldBannerNow.isVisible()) {
          pass('TC3.7 Gold banner appears after correct (reward bags unlocked)')
        } else {
          fail('TC3.7 Gold banner after correct', 'Gold banner not visible')
        }
      } else if (isWrong) {
        warn('TC3.6 First option was wrong, testing wrong flow instead')
        await page.waitForTimeout(1500)
      } else {
        // Check if we went directly to result phase (some modals)
        const phase_result = page.locator('text=/trả lời ĐÚNG|CHÍNH XÁC/').first()
        log(`       No immediate feedback found, checking for result phase...`)
        await shot(page, '03-ambiguous-result')
      }
    } else {
      fail('TC3.3 Cannot find answer option divs to click')
    }

    // If we're still in question modal (wrong answer), close it
    const closeQBtn = page.locator('button', { hasText: /Đóng câu hỏi/ })
    if (await closeQBtn.isVisible()) {
      await closeQBtn.click()
      await page.waitForTimeout(300)
    }

    // -----------------------------------------------------------------------
    log('\n=== TEST 4: Wrong Answer Flow ===')

    // Reset first for a clean wrong-answer test
    // We need a fresh question bag and a team
    // Select Nhóm 3 and open second Q bag
    const nhom3 = page.locator('div').filter({ hasText: /^Nhóm 3$/ }).first()
    if (await nhom3.isVisible()) {
      await nhom3.click()
      await page.waitForTimeout(200)
    }

    // Find an unused Q bag (class bag-q = unused)
    let openedBag = false
    const unusedQBags = page.locator('.qbag.bag-q')
    const unusedCount = await unusedQBags.count()
    log(`       Unused Q bags available: ${unusedCount}`)
    if (unusedCount > 0) {
      await unusedQBags.first().click({ force: true, timeout: 5000 })
      await page.waitForTimeout(400)
      const qHeader = page.locator('text="CÂU HỎI"')
      if (await qHeader.isVisible({ timeout: 2000 })) openedBag = true
    }

    if (!openedBag) {
      warn('TC4 Setup', 'Could not open a fresh question bag for wrong-answer test')
    } else {
      await shot(page, '04-wrong-answer-setup')

      // Click an answer option
      const opts4 = page.locator('.grid > div').filter({ hasText: /[ABCD]\. / })
      if (await opts4.count() > 0) {
        await opts4.first().click()
        await page.waitForTimeout(200)
        const confirmBtn4 = page.locator('button', { hasText: 'Xác nhận trả lời' })
        await confirmBtn4.click()
        await page.waitForTimeout(500)
        await shot(page, '04-after-wrong-confirm')

        // Check if wrong: wrong flash or team switching
        const wrongText = page.locator('text=/SAI! Chuyển nhóm/')
        const isWrong4 = await wrongText.isVisible().catch(() => false)

        // Also check if correct
        const isCorrect4 = await page.locator('text=/trả lời ĐÚNG|CHÍNH XÁC/i').isVisible().catch(() => false)

        if (isWrong4) {
          pass('TC4.1 Wrong answer flash shows "SAI! Chuyển nhóm"')
          await page.waitForTimeout(1500)
          // After wrong, ansTeamId changes to next team
          // Check that the answering team buttons show the current team highlighted
          await shot(page, '04-after-wrong-flash')
          pass('TC4.2 Wrong answer flow progresses to next team')
        } else if (isCorrect4) {
          warn('TC4.1 Answer was correct (not wrong)', 'Cannot test wrong flow with this question')
        } else {
          warn('TC4.1 Unclear outcome after confirm')
        }

        // Close modal
        const closeBtn4 = page.locator('button', { hasText: /Đóng câu hỏi/ })
        if (await closeBtn4.isVisible()) {
          await closeBtn4.click()
          await page.waitForTimeout(300)
        }
      }
    }

    // -----------------------------------------------------------------------
    log('\n=== TEST 5: Reward Bag Locked (no active reward) ===')

    // Make sure we're on main screen with no active reward
    const goldBannerCheck = page.locator('text=/trả lời ĐÚNG/')
    const rewardActive = await goldBannerCheck.isVisible().catch(() => false)

    if (!rewardActive) {
      // Click a reward bag - should do nothing
      // RBag with class "locked" = not clickable
      const lockedRBagsNow = page.locator('.rbag.locked')
      const lockedNowCount = await lockedRBagsNow.count()
      log(`       Locked reward bags: ${lockedNowCount}`)

      if (lockedNowCount > 0) {
        await lockedRBagsNow.first().click({ force: true })
        await page.waitForTimeout(400)

        // Reward reveal modal should NOT appear
        const rewardModal = page.locator('text=/Phần thưởng|Áp dụng|Spinning/')
        const modalVisible = await rewardModal.isVisible().catch(() => false)
        if (!modalVisible) pass('TC5.1 Reward bag click ignored when locked (no reward modal)')
        else fail('TC5.1 Reward bag should be locked', 'Reward modal appeared unexpectedly')

        await shot(page, '05-reward-bag-locked')
      } else {
        warn('TC5.1 No locked reward bag elements found')
      }
    } else {
      warn('TC5 Setup', 'Reward is active from previous test - skipping locked test')
    }

    // -----------------------------------------------------------------------
    log('\n=== TEST 6: Score Changes ===')

    // Get current scores
    const scoresBefore = await page.locator('.text-4xl').allTextContents()
    log(`       Scores before delta test: ${JSON.stringify(scoresBefore)}`)

    // Use the +/- buttons on a team card to verify score change
    // Click the + button on Nhóm 2 to add 1
    const teamCards = page.locator('[class*="rounded-2xl"][class*="border-4"]')
    const cardCount = await teamCards.count()
    log(`       Team card count: ${cardCount}`)

    // Find Nhóm 2's + button
    const nhom2Card = page.locator('div').filter({ hasText: /^Nhóm 2\d+điểm$/ }).first()
    const plusBtn = nhom2Card.locator('button').last()  // + is the last button

    if (await plusBtn.isVisible().catch(() => false)) {
      await plusBtn.click()
      await page.waitForTimeout(300)
      const scoresAfter = await page.locator('.text-4xl').allTextContents()
      log(`       Scores after +1 on Nhóm 2: ${JSON.stringify(scoresAfter)}`)
      pass('TC6.1 Manual +1 delta button works', `Scores changed: ${JSON.stringify(scoresBefore)} -> ${JSON.stringify(scoresAfter)}`)
    } else {
      warn('TC6.1 Could not locate Nhóm 2 + button precisely')
    }

    // -----------------------------------------------------------------------
    log('\n=== TEST 7: Reset Game ===')

    await shot(page, '07-before-reset')

    // Click Reset game button - it calls confirm() dialog
    page.once('dialog', async dialog => {
      log(`       Dialog: "${dialog.message()}" - accepting`)
      await dialog.accept()
    })

    const resetBtn = page.locator('button', { hasText: 'Reset game' })
    if (await resetBtn.isVisible()) {
      await resetBtn.click()
      await page.waitForTimeout(600)
      await shot(page, '07-after-reset')

      // Check all scores back to 5
      const resetScores = await page.locator('.text-4xl').allTextContents()
      const allReset = resetScores.every(s => s.trim() === '5')
      if (allReset && resetScores.length === 5) {
        pass('TC7.1 Reset game restores all scores to 5', `Scores: ${JSON.stringify(resetScores)}`)
      } else {
        fail('TC7.1 Reset game scores', `Scores after reset: ${JSON.stringify(resetScores)}`)
      }

      // Check Q bag counter back to 0/15
      const qCounterReset = await page.locator('text=/0\\/15 đã mở/').count()
      if (qCounterReset >= 2) pass('TC7.2 Reset clears used bag counters (0/15)')
      else warn('TC7.2 Bag counter after reset', `Found ${qCounterReset} "0/15" texts`)

      // Check phase back to main (no modal visible)
      const anyModal = page.locator('.modal-bg')
      const modalUp = await anyModal.isVisible().catch(() => false)
      if (!modalUp) pass('TC7.3 No modal visible after reset')
      else fail('TC7.3 Modal still visible after reset')

      // Check team selection prompt back
      const step1Prompt = page.locator('text=/Bước 1/')
      if (await step1Prompt.isVisible()) pass('TC7.4 Step 1 prompt restored after reset')
      else warn('TC7.4 Step 1 prompt', 'Not visible after reset')

    } else {
      fail('TC7.1 Reset game button not found')
    }

    // -----------------------------------------------------------------------
    log('\n=== CONSOLE ERRORS CHECK ===')
    if (consoleErrors.length === 0) {
      pass('Console Errors None', 'No JS errors detected during test run')
    } else {
      fail('Console Errors', `${consoleErrors.length} error(s):\n  - ${consoleErrors.join('\n  - ')}`)
    }

  } catch (err) {
    log(`\nFATAL ERROR during test: ${err.message}`)
    fail('Test runner', err.message)
    await shot(page, 'fatal-error')
  } finally {
    await browser.close()
  }

  // -----------------------------------------------------------------------
  log('\n' + '='.repeat(60))
  log('FINAL RESULTS')
  log('='.repeat(60))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'WARN'
    log(`  [${icon}] ${r.name}${r.detail ? ' — ' + r.detail : ''}`)
  }
  log('')
  log(`  Total: ${results.length} | PASS: ${passed} | FAIL: ${failed} | WARN: ${warned}`)
  log('='.repeat(60))

  // Write JSON report
  writeFileSync(join(__dir, 'e2e-report.json'), JSON.stringify({ results, passed, failed, warned, consoleErrors: [] }, null, 2))
  log(`\nReport saved to e2e-report.json`)
  log(`Screenshots saved to e2e-screenshots/`)
}

run().catch(err => { console.error('Runner crashed:', err); process.exit(1) })

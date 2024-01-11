// @ts-check
const { test, expect } = require('@playwright/test')
let page

const enabledPermalink = 'http://localhost:3000/?l=Last_of_the_Wild_1995-2004'
const disabledPermalink = 'http://localhost:3000/?l=Last_of_the_Wild_1995-2004(disabled=0-13-12-1-2-6)'

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test('Verify that toggling class updates permalink and layer-legend', async () => {
  await page.goto(enabledPermalink)
  const disabledClassification = await page.locator('#active-Last_of_the_Wild_1995-2004 .disabled-classification')
  await expect(disabledClassification).not.toBeVisible()
  await page.locator('#active-Last_of_the_Wild_1995-2004').hover()
  await page.locator('#active-Last_of_the_Wild_1995-2004 .wv-layers-options').click()
  await page.locator('.classification-list .react-switch-case .react-switch-button').first().click()
  // Step 1: Get the color box locator for the disabled classification
  const colorBoxDisabled = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active1.disabled-classification')
  // Step 2: Verify that the color box is not visible
  await expect(colorBoxDisabled).not.toBeVisible()
  // Step 3: Hover over the active layer
  await page.locator('#active-Last_of_the_Wild_1995-2004').hover()
  // Step 4: Click on the layer options
  await page.locator('#active-Last_of_the_Wild_1995-2004 .wv-layers-options').click()
  // Step 5: Click on the switch button to toggle the classification
  await page.locator('.classification-list .react-switch-case .react-switch-button').first().click()
  const url = await page.url()
  // Step 6: Verify that the URL contains the updated disabled state
  expect(url).toContain('(disabled=0)')
})

test('Verify that toggling class-all off updates permalink and layer-legend', async () => {
  await page.locator('div').filter({ hasText: 'Disable/EnableAll' }).locator('label').first().click()
  const firstColorBoxDisabled = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active0.disabled-classification')
  const lastColorBoxDisabled = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active15.disabled-classification')
  await expect(firstColorBoxDisabled).toBeVisible()
  await expect(lastColorBoxDisabled).toBeVisible()
  const url = await page.url()
  expect(url).toContain('(disabled=0-1-2-3-4-5-6-7-8-9-10-11-12-13-14-15)')
})

test('Verify that toggling class-all on updates permalink and layer-legend', async () => {
  await page.locator('div').filter({ hasText: 'Disable/EnableAll' }).locator('label').first().click()
  const firstColorBoxDisabled = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active0.disabled-classification')
  const lastColorBoxDisabled = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active15.disabled-classification')
  await expect(firstColorBoxDisabled).not.toBeVisible()
  await expect(lastColorBoxDisabled).not.toBeVisible()
})

test('Verify that loaded permalink disables classes', async () => {
  await page.goto(disabledPermalink)
  const colorBoxDisabledZero = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active0.disabled-classification')
  const colorBoxDisabledThirteen = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active13.disabled-classification')
  const colorBoxDisabledSix = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active6.disabled-classification')
  const colorBoxDisabledFive = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active5.disabled-classification')
  const colorBoxDisabledEleven = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active11.disabled-classification')
  const colorBoxDisabledThree = await page.locator('#Last_of_the_Wild_1995-2004_0_legend-color-Last_of_the_Wild_1995-2004-active3.disabled-classification')
  await expect(colorBoxDisabledZero).toBeVisible()
  await expect(colorBoxDisabledThirteen).toBeVisible()
  await expect(colorBoxDisabledSix).toBeVisible()
  await expect(colorBoxDisabledFive).not.toBeVisible()
  await expect(colorBoxDisabledEleven).not.toBeVisible()
  await expect(colorBoxDisabledThree).not.toBeVisible()
})

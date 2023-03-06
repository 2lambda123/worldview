// use this hook to make selections from dropdowns
const selectOption = async (page, element, index) => {
  const selectElement = await page.locator(element)
  await selectElement.selectOption({ index: index})
}

// return an elements attribute value for testing
const getAttribute = async (page, element, attribute) => {
  const el = await page.locator(element)
  const elAttribute = await el.getAttribute(attribute)
  return elAttribute
}

module.exports = {
  getAttribute,
  selectOption,
}
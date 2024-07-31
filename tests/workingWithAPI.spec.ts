import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async({page}) => {

  // MOCK CONFIGURATION1: request interception and substitution by different json
  await page.route('*/**/api/tags', async route => {  // 'route' is just a random name of a callback-function

    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  // MOCK CONFIGURATION2: intercept the REST response, modify the JSON body and then return it to the client.
  await page.route('*/**/api/articles?limit=10&offset=0', async rounteFunc => {
      const response = await rounteFunc.fetch() // complete the API call and return the resonse
      const responceBody = await response.json() // get json-object from response (.body() would return String)
      responceBody.articles[0].title = "This is a test title"
      responceBody.articles[0].description = "This is a test description"

      await rounteFunc.fulfill({
        body: JSON.stringify(responceBody)
      })
  })

  await page.goto('https://conduit.bondaracademy.com/')
})

test('has title', async ({ page }) => {
  await page.getByText('Popular Tags').waitFor({state: 'attached'}) // added to SEE the mocked tags, otherwise test passes, but you don't see the mocked tags (because PW is too fast)
  await expect(page.locator('.navbar-brand')).toHaveText('conduit') // Playwright runs too fast, need a wait to see everything rendered by browser
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a test description')
});

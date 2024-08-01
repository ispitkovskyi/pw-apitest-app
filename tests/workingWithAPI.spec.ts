import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'
import newArticle from '../test-data/newArticle.json'

test.beforeEach(async({page}) => {

  // MOCK CONFIGURATION1: request interception and substitution by different json
  await page.route('*/**/api/tags', async route => {  // 'route' is just a random name of a callback-function

    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/')
})


test('has title', async ({ page }) => {
    // MOCK CONFIGURATION2: intercept the REST response, modify the JSON body and then return it to the client.
    await page.route('*/**/api/articles?limit=10&offset=0', async rounteFunc => {
      const response = await rounteFunc.fetch() // complete the API call and return the resonse
      const responceBody = await response.json() // get json-object from response (.body() would return String)
      responceBody.articles[0].title = "This is a MOCK title"
      responceBody.articles[0].description = "This is a MOCK description"

      await rounteFunc.fulfill({
        body: JSON.stringify(responceBody)
      })
  })
  // Refresh the page in order to trigger the API call again, so mock will be picked up
  await page.getByText('Global Feed').click() // it will reload the list of the articles, and load the mocked content

  await page.getByText('Popular Tags').waitFor({state: 'attached'}) // added to SEE the mocked tags, otherwise test passes, but you don't see the mocked tags (because PW is too fast)
  await expect(page.locator('.navbar-brand')).toHaveText('conduit') // Playwright runs too fast, need a wait to see everything rendered by browser
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description')
});

test('delete article', async({page, request}) => {
   const newArticleJson = JSON.parse(JSON.stringify(newArticle))

/*    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: newArticleJson,
    headers: {
      Authorization: `Token ${accessToken}`
    }
   }) */

    /**
    * The Authorization token is added automatically
    * it is obtained inside setup method in auth.setup.ts specfile and saved to process.env[ACCESS_TOKEN]
    * the 'Use' configuration inside 'playwright.config.ts' is updated to automatically add this token to EACH request
    */
      const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        //  data: {
        //    "article":{"title":"This is a test title","description":"This is a test description","body":"This is a test body","tagList":[]}
        //  },
        data: newArticleJson,  
      })

   await expect(articleResponse.status()).toEqual(201)

   await page.getByText('Global Feed').click()
   await page.getByText('This is a test title').click()
   await page.getByRole('button', {name: ' Delete Article '}).first().click()

   await expect(page.locator('app-article-list h1').first()).not.toContainText('This is a test title')
})

test('intercept browser api response', async({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'Article Title'}).fill('Playwright is awesome')
  await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('About the Playwright')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('We like to use playwright for automation')
  await page.getByRole('button', {name: 'Publish Article'}).click()

  //wait for responce to the specified URL
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright is awesome')

/*    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: `Token ${accessToken}`
    }
   }) */

   /**
    * The Authorization token is added automatically
    * the token is obtained inside setup method in auth.setup.ts and saved to process.env[ACCESS_TOKEN]
    * the 'Use' configuration inside 'playwright.config.ts' is updated to automatically add this token to EACH request
    */
   const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`)

   expect(deleteResponse.status()).toEqual(204)
})
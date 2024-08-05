import { expect, test as setup } from '@playwright/test'
// import newArticle from '../test-data/newArticle.json'

setup('create new article', async({request}) => {
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
      data: {
           "article":{"title":"Likes test article","description":"This is a test description","body":"This is a test body","tagList":[]}
         },
      })

    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
})
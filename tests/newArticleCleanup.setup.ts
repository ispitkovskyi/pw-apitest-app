import {test as setup} from '@playwright/test'
import {expect} from '@playwright/test'

setup('delete article', async({request}) => {
    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env['SLUGID']}`)
    expect(deleteResponse.status()).toEqual(204)
})
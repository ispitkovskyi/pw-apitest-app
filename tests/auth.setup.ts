import { test as setup } from '@playwright/test'

// create a file to save the authenticated state
const authFile = '.auth/user.json'

// just use 'setup' alias for a 'test' method
setup('authentication', async ({page}) => {
    await page.goto('https://conduit.bondaracademy.com/')
    await page.getByText('Sign in').click()
    await page.getByRole('textbox', {name: 'Email'}).fill('terem222@ukr.net')
    await page.getByRole('textbox', {name: 'Password'}).fill('conduit')
    await page.getByRole('button').click()
    // just wait for response to some URL, which is always sent when the app is loaded
    // to make sure that the authentication has passed
    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags') 

    // Saves authenticated state of browser into a file
    await page.context().storageState({path: authFile})
})
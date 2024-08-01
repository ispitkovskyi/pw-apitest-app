import { test as setup } from '@playwright/test'
import user from '../.auth/user.json'
import fs from 'fs'  // 'file sync' default JavaScript library to work with files (CRUD)

// create a file to save the authenticated state
const authFile = '.auth/user.json'

/*
// THE WAY TO SAVE AUTHENTICATED STATE OF BROWSER USING UI ACTIONS
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
*/

/**
 * NOTE: This method rely on the '.auth/user.json' file to EXIST. 
 * Initially it was created by the UI-authentication method above, 
 * which created this file by await page.context().storageState({path: authFile})
 */
setup('authentication via API', async ({request}) => {
    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user":{"email":"terem222@ukr.net","password":"conduit"}
        }
       })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token

    // update access token value in the '../.auth/user.json' file with actual value of access token
    user.origins[0].localStorage[0].value = accessToken
    
    // save modified 'user' object to the '.auth/user.json' file
    // TO BE USED BY BROWSER
    fs.writeFileSync(authFile, JSON.stringify(user))

    // save access token into a NodeJS process environment variable
    // TO BE USED BY REST API CALLS
    process.env['ACCESS_TOKEN'] = accessToken
})
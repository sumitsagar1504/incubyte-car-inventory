import {test,expect} from '@playwright/test';
test('registration and login pages are reachable',async({page})=>{await page.goto('/register');await expect(page.getByText('Create your account')).toBeVisible();await page.getByRole('link',{name:'Sign in'}).click();await expect(page.getByText('Welcome back')).toBeVisible();await page.screenshot({path:'screenshots/login.png',fullPage:true})});

const { test, expect } = require('@playwright/test')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required to run login E2E tests`)
  }
  return value
}

test('test user can sign in through the login page', async ({ page }) => {
  requireEnv('E2E_BASE_URL')
  const username = requireEnv('E2E_USERNAME')
  const password = requireEnv('E2E_PASSWORD')

  await page.goto('/user/login')

  await page.getByPlaceholder('请输入账户名').fill(username)
  await page.getByPlaceholder('请输入密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()

  await expect(page).not.toHaveURL(/\/user\/login/)
  await expect(page.locator('.ant-pro-account-avatar')).toBeVisible()
})

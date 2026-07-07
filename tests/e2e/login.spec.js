const { test, expect } = require('@playwright/test')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required to run login E2E tests`)
  }
  return value
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('test user can sign in through the login page', async ({ page }) => {
  requireEnv('E2E_BASE_URL')
  const username = requireEnv('E2E_USERNAME')
  const password = requireEnv('E2E_PASSWORD')

  await page.goto('/user/login')

  await page.getByPlaceholder('请输入账户名').fill(username)
  await page.getByPlaceholder('请输入密码').fill(password)
  await page.getByRole('button', { name: /登\s*录/ }).click()

  await expect(page).toHaveURL(/#\/account\/workplace/)
  await expect(page.getByRole('heading', {
    name: new RegExp(`下午好，${escapeRegExp(username)}`)
  })).toBeVisible()
})

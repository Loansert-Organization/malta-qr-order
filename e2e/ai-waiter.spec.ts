import { test, expect } from '@playwright/test';

// Use a real bar ID from your development database
const TEST_BAR_ID = 'e1f8e6c0-5a4c-4a1a-9f6b-3a2b1c4c8e1a'; 
const MENU_PAGE_URL = `/menu/${TEST_BAR_ID}`;

test.describe('AI Waiter E2E Flow', () => {
  test('should open chat, send a message, and receive a reply', async ({ page }) => {
    // 1. Navigate to the menu page
    await page.goto(MENU_PAGE_URL);

    // 2. Wait for the prompt chip to appear after 10 seconds
    const chip = page.locator('button[aria-label="Open AI waiter chat"]');
    await expect(chip).toBeVisible({ timeout: 11000 });

    // 3. Click the chip to open the drawer
    await chip.click();

    // 4. Verify the drawer is open and visible
    const drawer = page.locator('.transition-transform.duration-300.translate-y-0');
    await expect(drawer).toBeVisible();
    await expect(page.locator('h3:has-text("Ask Kai-Waiter")')).toBeVisible();

    // 5. Type a message into the input
    const chatInput = page.locator('input[placeholder="Type your message…"]');
    await chatInput.fill('What is your most popular beer?');

    // 6. Send the message
    await page.locator('button:has-text("Send")').click();

    // 7. Assert that the user's message appears
    await expect(page.locator('.text-sm.leading-5:has-text("What is your most popular beer?")')).toBeVisible();

    // 8. Wait for and assert that the assistant's reply appears
    // The selector should target the assistant's message bubble
    const assistantReply = page.locator('.bg-muted >> .text-sm.leading-5');
    await expect(assistantReply).toBeVisible({ timeout: 10000 }); // Wait up to 10s for AI reply

    // Check that the reply has content.
    const replyText = await assistantReply.textContent();
    expect(replyText?.length).toBeGreaterThan(5);

    // 9. (Optional) Check for suggestion card if the reply contains one
    // This is a more advanced check for a later stage.
    
    // 10. Close the drawer
    await page.locator('button[aria-label="Close chat"]').click();
    await expect(drawer).not.toBeVisible();
  });
}); 
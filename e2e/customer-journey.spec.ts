// ✨ Refactored by Cursor – Audit Phase 4: E2E Customer Journey Test
import { test, expect, Page } from '@playwright/test';

interface TestMenuItem {
  name: string;
  price: string;
  description: string;
}

interface TestCustomer {
  name: string;
  phone: string;
  email: string;
}

const TEST_DATA = {
  vendor: {
    slug: 'demo-restaurant',
    name: 'Demo Restaurant'
  },
  customer: {
    name: 'John Doe',
    phone: '+356 9999 9999',
    email: 'john.doe@example.com'
  } as TestCustomer,
  menuItems: [
    {
      name: 'Margherita Pizza',
      price: '€12.50',
      description: 'Classic tomato and mozzarella'
    },
    {
      name: 'Caesar Salad',
      price: '€8.50',
      description: 'Fresh romaine with parmesan'
    }
  ] as TestMenuItem[]
};

test.describe('Customer Journey - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile testing
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mock geolocation
    await page.context().setGeolocation({ latitude: 35.8989, longitude: 14.5146 }); // Malta
    
    // Mock notifications permission
    await page.context().grantPermissions(['geolocation']);
  });

  test('complete customer journey: browse → add to cart → checkout → confirm', async ({ page }) => {
    // Step 1: Navigate to homepage
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      
      // Verify page loads
      await expect(page).toHaveTitle(/Malta QR Order/);
      await expect(page.getByText('Find nearby restaurants')).toBeVisible();
    });

    // Step 2: Find and select a restaurant
    await test.step('Select restaurant', async () => {
      // Wait for bars to load
      await expect(page.getByTestId('bars-list')).toBeVisible({ timeout: 10000 });
      
      // Select first available restaurant or demo restaurant
      const restaurantCard = page.getByTestId('restaurant-card').first();
      await expect(restaurantCard).toBeVisible();
      
      await restaurantCard.click();
      
      // Verify navigation to menu
      await expect(page).toHaveURL(/\/menu\/.+/);
    });

    // Step 3: Browse menu
    await test.step('Browse menu', async () => {
      // Wait for menu to load
      await expect(page.getByTestId('menu-container')).toBeVisible({ timeout: 10000 });
      
      // Verify menu items are displayed
      const menuItems = page.getByTestId('menu-item');
      await expect(menuItems.first()).toBeVisible();
      
      // Verify restaurant name is displayed
      await expect(page.getByTestId('restaurant-name')).toBeVisible();
    });

    // Step 4: Add items to cart
    await test.step('Add items to cart', async () => {
      // Add first menu item
      const firstItem = page.getByTestId('menu-item').first();
      const addToCartButton = firstItem.getByRole('button', { name: /add to cart/i });
      
      await addToCartButton.click();
      
      // Verify item added to cart
      await expect(page.getByTestId('cart-counter')).toContainText('1');
      
      // Add second item
      const secondItem = page.getByTestId('menu-item').nth(1);
      const secondAddButton = secondItem.getByRole('button', { name: /add to cart/i });
      
      await secondAddButton.click();
      
      // Verify cart count updated
      await expect(page.getByTestId('cart-counter')).toContainText('2');
    });

    // Step 5: Review cart
    await test.step('Review cart', async () => {
      // Open cart sidebar/modal
      await page.getByTestId('cart-button').click();
      
      // Verify cart contents
      await expect(page.getByTestId('cart-items')).toBeVisible();
      await expect(page.getByTestId('cart-item')).toHaveCount(2);
      
      // Verify total price calculation
      const cartTotal = page.getByTestId('cart-total');
      await expect(cartTotal).toBeVisible();
      await expect(cartTotal).toContainText('€');
    });

    // Step 6: Proceed to checkout
    await test.step('Proceed to checkout', async () => {
      await page.getByRole('button', { name: /proceed to checkout/i }).click();
      
      // Verify navigation to checkout
      await expect(page).toHaveURL(/\/checkout/);
      await expect(page.getByText('Checkout')).toBeVisible();
    });

    // Step 7: Fill customer information
    await test.step('Fill customer information', async () => {
      // Fill required fields
      await page.getByLabel(/name/i).fill(TEST_DATA.customer.name);
      await page.getByLabel(/phone/i).fill(TEST_DATA.customer.phone);
      await page.getByLabel(/email/i).fill(TEST_DATA.customer.email);
      
      // Select delivery option
      await page.getByRole('radio', { name: /pickup/i }).check();
      
      // Verify form validation
      await expect(page.getByLabel(/name/i)).toHaveValue(TEST_DATA.customer.name);
      await expect(page.getByLabel(/phone/i)).toHaveValue(TEST_DATA.customer.phone);
      await expect(page.getByLabel(/email/i)).toHaveValue(TEST_DATA.customer.email);
    });

    // Step 8: Review order summary
    await test.step('Review order summary', async () => {
      // Verify order items are displayed
      await expect(page.getByTestId('order-summary')).toBeVisible();
      await expect(page.getByTestId('order-item')).toHaveCount(2);
      
      // Verify pricing breakdown
      await expect(page.getByTestId('subtotal')).toBeVisible();
      await expect(page.getByTestId('total-amount')).toBeVisible();
    });

    // Step 9: Accept terms and conditions
    await test.step('Accept terms', async () => {
      await page.getByRole('checkbox', { name: /terms and conditions/i }).check();
      
      // Verify checkbox is checked
      await expect(page.getByRole('checkbox', { name: /terms and conditions/i })).toBeChecked();
    });

    // Step 10: Complete payment (mock)
    await test.step('Complete payment', async () => {
      // Select payment method
      await page.getByRole('radio', { name: /cash/i }).check();
      
      // Submit order
      await page.getByRole('button', { name: /place order/i }).click();
      
      // Verify navigation to confirmation
      await expect(page).toHaveURL(/\/confirm/, { timeout: 15000 });
    });

    // Step 11: Order confirmation
    await test.step('Verify order confirmation', async () => {
      // Verify confirmation page
      await expect(page.getByText('Order Confirmed')).toBeVisible();
      await expect(page.getByTestId('order-number')).toBeVisible();
      
      // Verify order details
      await expect(page.getByText(TEST_DATA.customer.name)).toBeVisible();
      await expect(page.getByTestId('order-items-confirmation')).toBeVisible();
      
      // Verify total amount
      await expect(page.getByTestId('confirmed-total')).toBeVisible();
    });
  });

  test('AI waiter interaction during customer journey', async ({ page }) => {
    await test.step('Navigate to menu', async () => {
      await page.goto('/menu/demo-restaurant');
      await expect(page.getByTestId('menu-container')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Open AI waiter', async () => {
      // Click AI waiter button
      await page.getByTestId('ai-waiter-button').click();
      
      // Verify AI waiter modal opens
      await expect(page.getByTestId('ai-waiter-modal')).toBeVisible();
      await expect(page.getByText('AI Waiter')).toBeVisible();
    });

    await test.step('Chat with AI waiter', async () => {
      // Type a message
      const chatInput = page.getByTestId('ai-chat-input');
      await chatInput.fill("What are your most popular dishes?");
      
      // Send message
      await page.getByRole('button', { name: /send/i }).click();
      
      // Wait for AI response
      await expect(page.getByTestId('ai-message')).toBeVisible({ timeout: 10000 });
      
      // Verify response contains menu suggestions
      await expect(page.getByTestId('ai-suggestions')).toBeVisible();
    });

    await test.step('Add suggested item to cart', async () => {
      // Click on first suggestion
      const suggestionButton = page.getByTestId('suggestion-add-to-cart').first();
      await suggestionButton.click();
      
      // Verify item added to cart
      await expect(page.getByTestId('cart-counter')).toContainText('1');
      
      // Close AI waiter
      await page.getByRole('button', { name: /close/i }).click();
    });
  });

  test('error handling during checkout', async ({ page }) => {
    await test.step('Navigate to checkout with empty cart', async () => {
      await page.goto('/checkout');
      
      // Should redirect to menu or show empty cart message
      await expect(
        page.getByText('Your cart is empty').or(page.getByText('Add items to cart'))
      ).toBeVisible();
    });

    await test.step('Form validation errors', async () => {
      // Add item to cart first
      await page.goto('/menu/demo-restaurant');
      await expect(page.getByTestId('menu-container')).toBeVisible({ timeout: 10000 });
      
      const firstItem = page.getByTestId('menu-item').first();
      await firstItem.getByRole('button', { name: /add to cart/i }).click();
      
      // Proceed to checkout
      await page.getByTestId('cart-button').click();
      await page.getByRole('button', { name: /proceed to checkout/i }).click();
      
      // Try to submit without required fields
      await page.getByRole('button', { name: /place order/i }).click();
      
      // Verify validation errors
      await expect(page.getByText(/name is required/i)).toBeVisible();
      await expect(page.getByText(/phone is required/i)).toBeVisible();
    });

    await test.step('Invalid form data', async () => {
      // Fill with invalid data
      await page.getByLabel(/name/i).fill('');
      await page.getByLabel(/phone/i).fill('invalid-phone');
      await page.getByLabel(/email/i).fill('invalid-email');
      
      // Try to submit
      await page.getByRole('button', { name: /place order/i }).click();
      
      // Verify validation errors
      await expect(page.getByText(/please enter a valid phone number/i)).toBeVisible();
      await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    });
  });

  test('mobile responsive behavior', async ({ page }) => {
    await test.step('Mobile menu navigation', async () => {
      await page.goto('/menu/demo-restaurant');
      await expect(page.getByTestId('menu-container')).toBeVisible({ timeout: 10000 });
      
      // Verify mobile layout
      await expect(page.getByTestId('mobile-menu-categories')).toBeVisible();
      
      // Test category switching
      const categoryTab = page.getByTestId('category-tab').first();
      await categoryTab.click();
      
      // Verify category content updates
      await expect(page.getByTestId('category-content')).toBeVisible();
    });

    await test.step('Mobile cart interaction', async () => {
      // Add item to cart
      const addButton = page.getByTestId('menu-item').first().getByRole('button', { name: /add to cart/i });
      await addButton.click();
      
      // Open mobile cart
      await page.getByTestId('mobile-cart-button').click();
      
      // Verify mobile cart view
      await expect(page.getByTestId('mobile-cart-modal')).toBeVisible();
      await expect(page.getByTestId('cart-item')).toHaveCount(1);
    });

    await test.step('Mobile checkout flow', async () => {
      await page.getByRole('button', { name: /checkout/i }).click();
      
      // Verify mobile checkout layout
      await expect(page.getByTestId('mobile-checkout-form')).toBeVisible();
      
      // Fill form on mobile
      await page.getByLabel(/name/i).fill(TEST_DATA.customer.name);
      await page.getByLabel(/phone/i).fill(TEST_DATA.customer.phone);
      await page.getByLabel(/email/i).fill(TEST_DATA.customer.email);
      
      // Verify mobile form behavior
      await expect(page.getByLabel(/name/i)).toHaveValue(TEST_DATA.customer.name);
    });
  });

  test('accessibility compliance', async ({ page }) => {
    await test.step('Keyboard navigation', async () => {
      await page.goto('/menu/demo-restaurant');
      await expect(page.getByTestId('menu-container')).toBeVisible({ timeout: 10000 });
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus management
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    await test.step('Screen reader support', async () => {
      // Verify ARIA labels
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('navigation')).toBeVisible();
      
      // Verify heading structure
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    await test.step('Color contrast and text size', async () => {
      // These would typically be tested with axe-core
      // For now, verify essential elements are visible
      await expect(page.getByTestId('menu-item-price')).toBeVisible();
      await expect(page.getByTestId('add-to-cart-button')).toBeVisible();
    });
  });
});

test.describe('Performance Testing', () => {
  test('page load performance', async ({ page }) => {
    // Start timing
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to load
    await expect(page.getByTestId('main-content')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Assert reasonable load time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(5000); // 5 seconds
  });

  test('menu loading performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/menu/demo-restaurant');
    
    // Wait for menu items to load
    await expect(page.getByTestId('menu-item').first()).toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Menu should load quickly
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });
}); 
// ✨ WhatsApp Autonomous AI Agent Implementation
import { supabase } from '@/integrations/supabase/client';
import type { MenuItem, Order, Vendor } from '@/types/api';

interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: string;
  messageId: string;
}

interface WhatsAppResponse {
  to: string;
  body: string;
  type: 'text' | 'interactive' | 'image';
  interactive?: WhatsAppInteractive;
}

interface WhatsAppInteractive {
  type: 'button' | 'list';
  body: { text: string };
  action: {
    buttons?: WhatsAppButton[];
    sections?: WhatsAppSection[];
  };
}

interface WhatsAppButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

interface WhatsAppSection {
  title: string;
  rows: WhatsAppRow[];
}

interface WhatsAppRow {
  id: string;
  title: string;
  description?: string;
}

interface CustomerSession {
  phoneNumber: string;
  vendorId?: string;
  currentCart: CartItem[];
  step: ConversationStep;
  preferences: CustomerPreferences;
  lastActivity: string;
}

interface CartItem {
  menuItemId: string;
  quantity: number;
  specialRequests?: string;
  modifiers?: string[];
}

interface CustomerPreferences {
  name?: string;
  favoriteItems?: string[];
  dietaryRestrictions?: string[];
  usualOrder?: CartItem[];
}

type ConversationStep = 
  | 'greeting' 
  | 'vendor_selection' 
  | 'menu_browsing' 
  | 'ordering' 
  | 'cart_review' 
  | 'payment' 
  | 'confirmation'
  | 'support';

class WhatsAppAIAgent {
  private sessions: Map<string, CustomerSession> = new Map();
  private vendors: Vendor[] = [];
  private menuItems: Map<string, MenuItem[]> = new Map();

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent(): Promise<void> {
    // Load vendors and menu data
    await this.loadVendorData();
    
    // Set up webhook listener (would be implemented with actual WhatsApp Business API)
    console.log('🤖 WhatsApp AI Agent initialized');
  }

  private async loadVendorData(): Promise<void> {
    try {
      // Load vendors
      const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', true);

      if (vendorError) throw vendorError;
      this.vendors = vendors || [];

      // Load menu items for each vendor
      for (const vendor of this.vendors) {
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('vendor_id', vendor.id)
          .eq('available', true);

        if (!itemsError && items) {
          this.menuItems.set(vendor.id, items);
        }
      }
    } catch (error) {
      console.error('Failed to load vendor data:', error);
    }
  }

  // Main message processing entry point
  async processIncomingMessage(message: WhatsAppMessage): Promise<WhatsAppResponse[]> {
    const session = this.getOrCreateSession(message.from);
    const responses: WhatsAppResponse[] = [];

    try {
      // Update last activity
      session.lastActivity = new Date().toISOString();

      // Log incoming message
      await this.logMessage(message, 'incoming', session.vendorId);

      // Process based on current conversation step
      const aiResponses = await this.generateAIResponse(message, session);
      
      // Update session state
      this.sessions.set(message.from, session);

      // Log outgoing responses
      for (const response of aiResponses) {
        await this.logMessage({
          from: 'system',
          body: response.body,
          timestamp: new Date().toISOString(),
          messageId: crypto.randomUUID()
        }, 'outgoing', session.vendorId);
      }

      return aiResponses;

    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      
      const errorResponse: WhatsAppResponse = {
        to: message.from,
        body: "I'm having trouble processing your request right now. Please try again in a moment, or type 'help' for assistance.",
        type: 'text'
      };

      return [errorResponse];
    }
  }

  private getOrCreateSession(phoneNumber: string): CustomerSession {
    if (!this.sessions.has(phoneNumber)) {
      this.sessions.set(phoneNumber, {
        phoneNumber,
        currentCart: [],
        step: 'greeting',
        preferences: {},
        lastActivity: new Date().toISOString()
      });
    }

    return this.sessions.get(phoneNumber)!;
  }

  private async generateAIResponse(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    const userMessage = message.body.toLowerCase().trim();
    
    // Handle special commands
    if (userMessage === 'help' || userMessage === 'support') {
      return this.generateHelpResponse(message.from);
    }

    if (userMessage === 'start' || userMessage === 'hi' || userMessage === 'hello') {
      session.step = 'greeting';
      return this.generateGreetingResponse(message.from, session);
    }

    if (userMessage === 'cart' || userMessage === 'my order') {
      return this.generateCartSummary(message.from, session);
    }

    // Process based on conversation step
    switch (session.step) {
      case 'greeting':
        return this.handleGreeting(message, session);
      case 'vendor_selection':
        return this.handleVendorSelection(message, session);
      case 'menu_browsing':
        return this.handleMenuBrowsing(message, session);
      case 'ordering':
        return this.handleOrdering(message, session);
      case 'cart_review':
        return this.handleCartReview(message, session);
      case 'payment':
        return this.handlePayment(message, session);
      case 'confirmation':
        return this.handleConfirmation(message, session);
      default:
        return this.generateHelpResponse(message.from);
    }
  }

  private async generateGreetingResponse(
    phoneNumber: string, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    const responses: WhatsAppResponse[] = [];

    // Welcome message
    responses.push({
      to: phoneNumber,
      body: `🇲🇹 Welcome to ICUPA Malta! I'm your AI dining assistant.\n\nI can help you:\n🍽️ Find nearby restaurants\n📱 Browse menus\n🛒 Place orders\n💬 Get recommendations\n\nLet's start by finding you a great place to eat!`,
      type: 'text'
    });

    // Vendor selection interactive message
    const vendorButtons: WhatsAppButton[] = this.vendors.slice(0, 3).map(vendor => ({
      type: 'reply',
      reply: {
        id: `vendor_${vendor.id}`,
        title: vendor.name.length > 20 ? vendor.name.substring(0, 17) + '...' : vendor.name
      }
    }));

    responses.push({
      to: phoneNumber,
      body: 'Choose a restaurant to browse their menu:',
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'Select a restaurant:' },
        action: { buttons: vendorButtons }
      }
    });

    session.step = 'vendor_selection';
    return responses;
  }

  private async handleGreeting(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    // Extract intent from greeting
    const userMessage = message.body.toLowerCase();
    
    if (userMessage.includes('order') || userMessage.includes('food') || userMessage.includes('hungry')) {
      return this.generateGreetingResponse(message.from, session);
    }

    if (userMessage.includes('menu') || userMessage.includes('restaurant')) {
      return this.generateGreetingResponse(message.from, session);
    }

    // Default to vendor selection
    return this.generateGreetingResponse(message.from, session);
  }

  private async handleVendorSelection(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    const userMessage = message.body.toLowerCase();
    let selectedVendor: Vendor | null = null;

    // Check if message contains vendor selection button response
    if (userMessage.startsWith('vendor_')) {
      const vendorId = userMessage.replace('vendor_', '');
      selectedVendor = this.vendors.find(v => v.id === vendorId) || null;
    } else {
      // Try to match vendor name from text
      selectedVendor = this.vendors.find(v => 
        v.name.toLowerCase().includes(userMessage) ||
        userMessage.includes(v.name.toLowerCase())
      ) || null;
    }

    if (!selectedVendor) {
      // Vendor not found, show options again
      return [{
        to: message.from,
        body: `I couldn't find that restaurant. Here are our available options:\n\n${this.vendors.map((v, i) => `${i + 1}. ${v.name}`).join('\n')}\n\nPlease choose by typing the restaurant name or number.`,
        type: 'text'
      }];
    }

    // Set selected vendor and move to menu browsing
    session.vendorId = selectedVendor.id;
    session.step = 'menu_browsing';

    const menuItems = this.menuItems.get(selectedVendor.id) || [];
    const categories = [...new Set(menuItems.map(item => item.category).filter(Boolean))];

    const responses: WhatsAppResponse[] = [];

    // Vendor selection confirmation
    responses.push({
      to: message.from,
      body: `🍽️ Great choice! You've selected *${selectedVendor.name}*\n\n${selectedVendor.description || 'Delicious food awaits!'}\n\nWhat would you like to browse?`,
      type: 'text'
    });

    // Category selection
    if (categories.length > 0) {
      const categoryButtons: WhatsAppButton[] = categories.slice(0, 3).map(category => ({
        type: 'reply',
        reply: {
          id: `category_${category}`,
          title: category || 'All Items'
        }
      }));

      responses.push({
        to: message.from,
        body: 'Browse by category:',
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: 'Choose a category:' },
          action: { buttons: categoryButtons }
        }
      });
    }

    return responses;
  }

  private async handleMenuBrowsing(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    if (!session.vendorId) {
      session.step = 'vendor_selection';
      return this.generateGreetingResponse(message.from, session);
    }

    const menuItems = this.menuItems.get(session.vendorId) || [];
    const userMessage = message.body.toLowerCase();

    // Check for category selection
    let categoryFilter: string | null = null;
    if (userMessage.startsWith('category_')) {
      categoryFilter = userMessage.replace('category_', '');
    }

    // Filter items based on search or category
    let filteredItems = menuItems;
    if (categoryFilter) {
      filteredItems = menuItems.filter(item => item.category === categoryFilter);
    } else if (userMessage.length > 2) {
      // Search in item names and descriptions
      filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(userMessage) ||
        item.description?.toLowerCase().includes(userMessage)
      );
    }

    if (filteredItems.length === 0) {
      return [{
        to: message.from,
        body: `No items found matching "${message.body}". Try searching for something else or type "menu" to see all items.`,
        type: 'text'
      }];
    }

    // Show menu items (limit to 10)
    const itemsToShow = filteredItems.slice(0, 10);
    let menuText = `🍽️ *Menu Items*${categoryFilter ? ` (${categoryFilter})` : ''}:\n\n`;
    
    itemsToShow.forEach((item, index) => {
      menuText += `${index + 1}. *${item.name}* - €${item.price}\n`;
      if (item.description) {
        menuText += `   ${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}\n`;
      }
      menuText += '\n';
    });

    menuText += `💬 Reply with the item number to add it to your cart, or ask me for recommendations!\n\nType "cart" to view your current order.`;

    session.step = 'ordering';
    
    return [{
      to: message.from,
      body: menuText,
      type: 'text'
    }];
  }

  private async handleOrdering(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    const userMessage = message.body.toLowerCase().trim();
    const menuItems = this.menuItems.get(session.vendorId!) || [];

    // Check if user typed a number (item selection)
    const itemNumber = parseInt(userMessage);
    if (!isNaN(itemNumber) && itemNumber > 0 && itemNumber <= menuItems.length) {
      const selectedItem = menuItems[itemNumber - 1];
      
      // Add to cart
      const existingItem = session.currentCart.find(cartItem => cartItem.menuItemId === selectedItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        session.currentCart.push({
          menuItemId: selectedItem.id,
          quantity: 1
        });
      }

      const responses: WhatsAppResponse[] = [];

      responses.push({
        to: message.from,
        body: `✅ Added *${selectedItem.name}* to your cart!\n\nWould you like to:\n1. Add more items\n2. View cart\n3. Checkout\n\nJust type your choice or ask for recommendations!`,
        type: 'text'
      });

      return responses;
    }

    // Handle other ordering intents
    if (userMessage.includes('recommend') || userMessage.includes('popular') || userMessage.includes('best')) {
      const popularItems = menuItems.filter(item => item.popular).slice(0, 3);
      
      if (popularItems.length > 0) {
        let recommendText = `⭐ *Popular Recommendations:*\n\n`;
        popularItems.forEach((item, index) => {
          recommendText += `${index + 1}. *${item.name}* - €${item.price}\n`;
          if (item.description) {
            recommendText += `   ${item.description}\n`;
          }
          recommendText += '\n';
        });
        recommendText += `Reply with the number to add to cart!`;

        return [{
          to: message.from,
          body: recommendText,
          type: 'text'
        }];
      }
    }

    // Default response for ordering step
    return [{
      to: message.from,
      body: `I can help you add items to your cart! Try:\n\n• Type a number to select an item\n• Ask for "recommendations"\n• Search for specific dishes\n• Type "menu" to see all items\n• Type "cart" to review your order`,
      type: 'text'
    }];
  }

  private async generateCartSummary(
    phoneNumber: string, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    if (session.currentCart.length === 0) {
      return [{
        to: phoneNumber,
        body: `🛒 Your cart is empty.\n\nType "menu" to browse items or ask me for recommendations!`,
        type: 'text'
      }];
    }

    const menuItems = this.menuItems.get(session.vendorId!) || [];
    let cartText = `🛒 *Your Order:*\n\n`;
    let total = 0;

    session.currentCart.forEach((cartItem, index) => {
      const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
      if (menuItem) {
        const itemTotal = menuItem.price * cartItem.quantity;
        total += itemTotal;
        cartText += `${index + 1}. ${menuItem.name} x${cartItem.quantity} - €${itemTotal.toFixed(2)}\n`;
      }
    });

    cartText += `\n💰 *Total: €${total.toFixed(2)}*\n\n`;
    cartText += `Ready to order? Type:\n• "checkout" to place order\n• "add" to add more items\n• "remove [number]" to remove item`;

    session.step = 'cart_review';

    return [{
      to: phoneNumber,
      body: cartText,
      type: 'text'
    }];
  }

  private async handleCartReview(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    const userMessage = message.body.toLowerCase().trim();

    if (userMessage === 'checkout' || userMessage.includes('order') || userMessage === 'confirm') {
      return this.generateCheckoutFlow(message.from, session);
    }

    if (userMessage === 'add' || userMessage.includes('more')) {
      session.step = 'menu_browsing';
      return [{
        to: message.from,
        body: `What else would you like to add? Type an item name or "menu" to see all options.`,
        type: 'text'
      }];
    }

    // Handle item removal
    if (userMessage.startsWith('remove')) {
      const parts = userMessage.split(' ');
      const itemIndex = parseInt(parts[1]) - 1;
      
      if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < session.currentCart.length) {
        const removedItem = session.currentCart.splice(itemIndex, 1)[0];
        const menuItems = this.menuItems.get(session.vendorId!) || [];
        const menuItem = menuItems.find(item => item.id === removedItem.menuItemId);
        
        return [{
          to: message.from,
          body: `✅ Removed ${menuItem?.name || 'item'} from your cart.\n\nType "cart" to see updated order or "checkout" when ready.`,
          type: 'text'
        }];
      }
    }

    return [{
      to: message.from,
      body: `I can help you with your cart! Try:\n• "checkout" - Place your order\n• "add" - Add more items\n• "remove [number]" - Remove item\n• "cart" - See current order`,
      type: 'text'
    }];
  }

  private async generateCheckoutFlow(
    phoneNumber: string, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    if (!session.preferences.name) {
      session.step = 'payment';
      return [{
        to: phoneNumber,
        body: `📝 To complete your order, I'll need your name.\n\nWhat name should I put for this order?`,
        type: 'text'
      }];
    }

    return this.generatePaymentOptions(phoneNumber, session);
  }

  private async generatePaymentOptions(
    phoneNumber: string, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    const vendor = this.vendors.find(v => v.id === session.vendorId);
    if (!vendor) {
      return [{
        to: phoneNumber,
        body: `❌ Error: Restaurant information not found. Please start over.`,
        type: 'text'
      }];
    }

    const responses: WhatsAppResponse[] = [];

    // Order summary
    const menuItems = this.menuItems.get(session.vendorId!) || [];
    let total = 0;
    session.currentCart.forEach(cartItem => {
      const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
      if (menuItem) {
        total += menuItem.price * cartItem.quantity;
      }
    });

    responses.push({
      to: phoneNumber,
      body: `💳 *Payment & Pickup*\n\n📍 *${vendor.name}*\n💰 *Total: €${total.toFixed(2)}*\n\nPayment options:`,
      type: 'text'
    });

    // Payment buttons
    const paymentButtons: WhatsAppButton[] = [
      {
        type: 'reply',
        reply: { id: 'pay_revolut', title: '💳 Revolut' }
      },
      {
        type: 'reply', 
        reply: { id: 'pay_cash', title: '💵 Cash at pickup' }
      }
    ];

    responses.push({
      to: phoneNumber,
      body: 'Choose payment method:',
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'How would you like to pay?' },
        action: { buttons: paymentButtons }
      }
    });

    return responses;
  }

  private async handlePayment(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    
    const userMessage = message.body.toLowerCase().trim();

    // Handle name collection
    if (!session.preferences.name && !userMessage.startsWith('pay_')) {
      session.preferences.name = message.body.trim();
      return this.generatePaymentOptions(message.from, session);
    }

    // Handle payment selection
    if (userMessage.startsWith('pay_')) {
      const paymentMethod = userMessage.replace('pay_', '');
      return this.processPayment(message.from, session, paymentMethod);
    }

    return [{
      to: message.from,
      body: `Please select a payment method or provide your name for the order.`,
      type: 'text'
    }];
  }

  private async processPayment(
    phoneNumber: string, 
    session: CustomerSession, 
    paymentMethod: string
  ): Promise<WhatsAppResponse[]> {
    
    try {
      // Create order in database
      const order = await this.createOrder(session, paymentMethod);
      
      session.step = 'confirmation';

      const responses: WhatsAppResponse[] = [];

      if (paymentMethod === 'revolut') {
        const vendor = this.vendors.find(v => v.id === session.vendorId);
        responses.push({
          to: phoneNumber,
          body: `💳 Please complete payment via Revolut:\n\n${vendor?.revolut_link || 'Revolut payment link not available'}\n\nOnce payment is confirmed, your order will be prepared!`,
          type: 'text'
        });
      }

      // Order confirmation
      responses.push({
        to: phoneNumber,
        body: `✅ *Order Confirmed!*\n\n🆔 Order #${order.id.substring(0, 8).toUpperCase()}\n👤 Name: ${session.preferences.name}\n⏱️ Estimated time: 15-20 minutes\n\n📞 The restaurant will contact you when ready for pickup.\n\nThank you for using ICUPA Malta! 🇲🇹`,
        type: 'text'
      });

      // Clear cart
      session.currentCart = [];
      session.step = 'greeting';

      return responses;

    } catch (error) {
      console.error('Error processing payment:', error);
      return [{
        to: phoneNumber,
        body: `❌ Sorry, there was an error processing your order. Please try again or contact support.`,
        type: 'text'
      }];
    }
  }

  private async createOrder(session: CustomerSession, paymentMethod: string): Promise<Order> {
    const menuItems = this.menuItems.get(session.vendorId!) || [];
    let total = 0;
    
    const orderItems = session.currentCart.map(cartItem => {
      const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
      if (menuItem) {
        const itemTotal = menuItem.price * cartItem.quantity;
        total += itemTotal;
        return {
          id: crypto.randomUUID(),
          order_id: '', // Will be set after order creation
          menu_item_id: cartItem.menuItemId,
          quantity: cartItem.quantity,
          unit_price: menuItem.price,
          total_price: itemTotal,
          special_requests: cartItem.specialRequests || null
        };
      }
      return null;
    }).filter(Boolean);

    const orderData = {
      vendor_id: session.vendorId,
      items: orderItems,
      total_amount: total,
      currency: 'EUR',
      country: 'Malta',
      order_status: 'pending' as const,
      payment_status: paymentMethod === 'cash' ? 'pending' : 'processing' as const,
      customer_info: {
        name: session.preferences.name,
        phone: session.phoneNumber
      },
      agreed_to_terms: true,
      whatsapp_consent: true,
      marketing_consent: false
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return order;
  }

  private async generateHelpResponse(phoneNumber: string): Promise<WhatsAppResponse[]> {
    return [{
      to: phoneNumber,
      body: `🤖 *ICUPA Malta AI Assistant Help*\n\nI can help you:\n\n🍽️ Browse restaurant menus\n🛒 Add items to cart\n💳 Place orders\n📞 Get recommendations\n\n*Commands:*\n• "start" - Begin ordering\n• "menu" - Browse items\n• "cart" - View current order\n• "help" - Show this help\n\nJust chat with me naturally - I understand what you need! 😊`,
      type: 'text'
    }];
  }

  private async logMessage(
    message: WhatsAppMessage, 
    direction: 'incoming' | 'outgoing',
    vendorId?: string
  ): Promise<void> {
    try {
      await supabase.from('whatsapp_logs').insert({
        vendor_id: vendorId,
        direction,
        message: message.body,
        status: 'sent',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log WhatsApp message:', error);
    }
  }

  private async handleConfirmation(
    message: WhatsAppMessage, 
    session: CustomerSession
  ): Promise<WhatsAppResponse[]> {
    // Handle post-order conversation
    const userMessage = message.body.toLowerCase();
    
    if (userMessage.includes('status') || userMessage.includes('order')) {
      return [{
        to: message.from,
        body: `📋 Your recent order is being prepared. You'll receive a call when it's ready for pickup.\n\nIs there anything else I can help you with?`,
        type: 'text'
      }];
    }

    if (userMessage.includes('new') || userMessage.includes('another')) {
      session.step = 'greeting';
      return this.generateGreetingResponse(message.from, session);
    }

    return [{
      to: message.from,
      body: `Thank you! If you need to place another order, just type "start" or ask me anything! 😊`,
      type: 'text'
    }];
  }

  // Cleanup old sessions (call periodically)
  cleanupOldSessions(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [phoneNumber, session] of this.sessions.entries()) {
      if (new Date(session.lastActivity) < cutoffTime) {
        this.sessions.delete(phoneNumber);
      }
    }
  }
}

// Export singleton instance
export const whatsappAIAgent = new WhatsAppAIAgent();

// Webhook handler for WhatsApp Business API
export async function handleWhatsAppWebhook(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    
    // Verify webhook (implement WhatsApp verification logic)
    if (body.hub?.mode === 'subscribe') {
      return new Response(body.hub.challenge, { status: 200 });
    }

    // Process incoming messages
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const messages = body.entry[0].changes[0].value.messages;
      
      for (const message of messages) {
        const whatsappMessage: WhatsAppMessage = {
          from: message.from,
          body: message.text?.body || '',
          timestamp: new Date().toISOString(),
          messageId: message.id
        };

        // Process with AI agent
        const responses = await whatsappAIAgent.processIncomingMessage(whatsappMessage);
        
        // Send responses back (implement actual WhatsApp API calls)
        for (const response of responses) {
          await sendWhatsAppMessage(response);
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

// Mock function - implement with actual WhatsApp Business API
async function sendWhatsAppMessage(response: WhatsAppResponse): Promise<void> {
  console.log('📱 Sending WhatsApp message:', response);
  // Implement actual WhatsApp Business API call here
}

export default WhatsAppAIAgent; 
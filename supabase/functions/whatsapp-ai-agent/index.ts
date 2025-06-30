// ✨ WhatsApp AI Agent - Autonomous Ordering System
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: { body: string };
  type: string;
}

interface CustomerSession {
  phoneNumber: string;
  vendorId?: string;
  currentCart: CartItem[];
  step: ConversationStep;
  preferences: CustomerPreferences;
  lastActivity: string;
  orderHistory: string[];
}

interface CartItem {
  menuItemId: string;
  quantity: number;
  specialRequests?: string;
  price: number;
  name: string;
}

interface CustomerPreferences {
  name?: string;
  favoriteItems?: string[];
  dietaryRestrictions?: string[];
  preferredVendor?: string;
}

type ConversationStep = 
  | 'greeting' 
  | 'vendor_selection' 
  | 'menu_browsing' 
  | 'ordering' 
  | 'cart_review' 
  | 'customer_info'
  | 'payment' 
  | 'confirmation'
  | 'support';

class WhatsAppAIAgent {
  private sessions: Map<string, CustomerSession> = new Map();

  async processMessage(message: WhatsAppMessage): Promise<any[]> {
    try {
      const session = await this.getOrCreateSession(message.from);
      const userMessage = message.text?.body?.toLowerCase().trim() || '';

      // Log incoming message
      await this.logMessage(message.from, userMessage, 'incoming', session.vendorId);

      // Handle special commands
      if (userMessage === 'help' || userMessage === 'support') {
        return await this.sendHelpMessage(message.from);
      }

      if (userMessage === 'start' || userMessage === 'hi' || userMessage === 'hello') {
        return await this.sendGreeting(message.from, session);
      }

      if (userMessage === 'cart' || userMessage === 'my order') {
        return await this.sendCartSummary(message.from, session);
      }

      if (userMessage === 'menu') {
        return await this.sendMenuOptions(message.from, session);
      }

      // Process based on conversation step
      const responses = await this.handleConversationStep(message.from, userMessage, session);
      
      // Update session
      session.lastActivity = new Date().toISOString();
      await this.updateSession(session);

      return responses;

    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return await this.sendErrorMessage(message.from);
    }
  }

  private async getOrCreateSession(phoneNumber: string): Promise<CustomerSession> {
    // Try to get existing session from database
    const { data: sessionData } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (sessionData) {
      const session: CustomerSession = {
        phoneNumber: sessionData.phone_number,
        vendorId: sessionData.vendor_id,
        currentCart: sessionData.current_cart || [],
        step: sessionData.conversation_step || 'greeting',
        preferences: sessionData.preferences || {},
        lastActivity: sessionData.last_activity,
        orderHistory: sessionData.order_history || []
      };
      
      this.sessions.set(phoneNumber, session);
      return session;
    }

    // Create new session
    const newSession: CustomerSession = {
      phoneNumber,
      currentCart: [],
      step: 'greeting',
      preferences: {},
      lastActivity: new Date().toISOString(),
      orderHistory: []
    };

    this.sessions.set(phoneNumber, newSession);
    return newSession;
  }

  private async updateSession(session: CustomerSession): Promise<void> {
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        phone_number: session.phoneNumber,
        vendor_id: session.vendorId,
        current_cart: session.currentCart,
        conversation_step: session.step,
        preferences: session.preferences,
        last_activity: session.lastActivity,
        order_history: session.orderHistory
      });
  }

  private async handleConversationStep(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    switch (session.step) {
      case 'greeting':
        return await this.handleGreeting(phoneNumber, userMessage, session);
      case 'vendor_selection':
        return await this.handleVendorSelection(phoneNumber, userMessage, session);
      case 'menu_browsing':
        return await this.handleMenuBrowsing(phoneNumber, userMessage, session);
      case 'ordering':
        return await this.handleOrdering(phoneNumber, userMessage, session);
      case 'cart_review':
        return await this.handleCartReview(phoneNumber, userMessage, session);
      case 'customer_info':
        return await this.handleCustomerInfo(phoneNumber, userMessage, session);
      case 'payment':
        return await this.handlePayment(phoneNumber, userMessage, session);
      case 'confirmation':
        return await this.handleConfirmation(phoneNumber, userMessage, session);
      default:
        return await this.sendHelpMessage(phoneNumber);
    }
  }

  private async sendGreeting(phoneNumber: string, session: CustomerSession): Promise<any[]> {
    const responses = [];

    // Welcome message
    responses.push(await this.sendTextMessage(
      phoneNumber,
      `🇲🇹 Welcome to ICUPA Malta! I'm your AI dining assistant.\n\nI can help you:\n🍽️ Find nearby restaurants\n📱 Browse menus\n🛒 Place orders\n💬 Get recommendations\n\nLet's start by finding you a great place to eat!`
    ));

    // Get available vendors
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, name, description, cuisine_type')
      .eq('active', true)
      .limit(10);

    if (vendors && vendors.length > 0) {
      // Create interactive buttons for top vendors
      const buttons = vendors.slice(0, 3).map(vendor => ({
        type: "reply",
        reply: {
          id: `vendor_${vendor.id}`,
          title: vendor.name.length > 20 ? vendor.name.substring(0, 17) + '...' : vendor.name
        }
      }));

      responses.push(await this.sendInteractiveMessage(
        phoneNumber,
        "Choose a restaurant to browse their menu:",
        "Select a restaurant:",
        buttons
      ));
    }

    session.step = 'vendor_selection';
    return responses;
  }

  private async handleVendorSelection(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    let selectedVendor = null;

    // Check if message contains vendor selection button response
    if (userMessage.startsWith('vendor_')) {
      const vendorId = userMessage.replace('vendor_', '');
      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();
      selectedVendor = vendor;
    } else {
      // Try to match vendor name from text
      const { data: vendors } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', true);

      selectedVendor = vendors?.find(v => 
        v.name.toLowerCase().includes(userMessage) ||
        userMessage.includes(v.name.toLowerCase())
      );
    }

    if (!selectedVendor) {
      return [await this.sendVendorOptions(phoneNumber)];
    }

    // Set selected vendor and move to menu browsing
    session.vendorId = selectedVendor.id;
    session.step = 'menu_browsing';
    session.preferences.preferredVendor = selectedVendor.id;

    const responses = [];

    // Vendor selection confirmation
    responses.push(await this.sendTextMessage(
      phoneNumber,
      `🍽️ Great choice! You've selected *${selectedVendor.name}*\n\n${selectedVendor.description || 'Delicious food awaits!'}\n\nWhat would you like to browse?`
    ));

    // Get menu categories
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('category')
      .eq('vendor_id', selectedVendor.id)
      .eq('available', true);

    const categories = [...new Set(menuItems?.map(item => item.category).filter(Boolean))];

    if (categories.length > 0) {
      const categoryButtons = categories.slice(0, 3).map(category => ({
        type: "reply",
        reply: {
          id: `category_${category}`,
          title: category
        }
      }));

      responses.push(await this.sendInteractiveMessage(
        phoneNumber,
        "Browse by category:",
        "Choose a category:",
        categoryButtons
      ));
    }

    return responses;
  }

  private async handleMenuBrowsing(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    if (!session.vendorId) {
      session.step = 'vendor_selection';
      return await this.sendGreeting(phoneNumber, session);
    }

    // Get menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('vendor_id', session.vendorId)
      .eq('available', true);

    if (!menuItems || menuItems.length === 0) {
      return [await this.sendTextMessage(
        phoneNumber,
        "Sorry, no menu items are available at the moment. Please try again later."
      )];
    }

    // Check for category selection
    let filteredItems = menuItems;
    if (userMessage.startsWith('category_')) {
      const category = userMessage.replace('category_', '');
      filteredItems = menuItems.filter(item => item.category === category);
    } else if (userMessage.length > 2) {
      // Search in item names and descriptions
      filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(userMessage) ||
        item.description?.toLowerCase().includes(userMessage)
      );
    }

    if (filteredItems.length === 0) {
      return [await this.sendTextMessage(
        phoneNumber,
        `No items found matching "${userMessage}". Try searching for something else or type "menu" to see all items.`
      )];
    }

    // Show menu items (limit to 10)
    const itemsToShow = filteredItems.slice(0, 10);
    let menuText = `🍽️ *Menu Items*:\n\n`;
    
    itemsToShow.forEach((item, index) => {
      menuText += `${index + 1}. *${item.name}* - €${item.price}\n`;
      if (item.description) {
        menuText += `   ${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}\n`;
      }
      menuText += '\n';
    });

    menuText += `💬 Reply with the item number to add it to your cart, or ask me for recommendations!\n\nType "cart" to view your current order.`;

    session.step = 'ordering';
    
    return [await this.sendTextMessage(phoneNumber, menuText)];
  }

  private async handleOrdering(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    // Get menu items for this vendor
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('vendor_id', session.vendorId!)
      .eq('available', true);

    if (!menuItems) return [await this.sendErrorMessage(phoneNumber)];

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
          quantity: 1,
          price: selectedItem.price,
          name: selectedItem.name
        });
      }

      return [await this.sendTextMessage(
        phoneNumber,
        `✅ Added *${selectedItem.name}* to your cart!\n\nWould you like to:\n1. Add more items\n2. View cart\n3. Checkout\n\nJust type your choice or ask for recommendations!`
      )];
    }

    // Handle other ordering intents
    if (userMessage.includes('recommend') || userMessage.includes('popular') || userMessage.includes('best')) {
      return await this.sendRecommendations(phoneNumber, session);
    }

    // Default response for ordering step
    return [await this.sendTextMessage(
      phoneNumber,
      `I can help you add items to your cart! Try:\n\n• Type a number to select an item\n• Ask for "recommendations"\n• Search for specific dishes\n• Type "menu" to see all items\n• Type "cart" to review your order`
    )];
  }

  private async sendCartSummary(phoneNumber: string, session: CustomerSession): Promise<any[]> {
    if (session.currentCart.length === 0) {
      return [await this.sendTextMessage(
        phoneNumber,
        `🛒 Your cart is empty.\n\nType "menu" to browse items or ask me for recommendations!`
      )];
    }

    let cartText = `🛒 *Your Order:*\n\n`;
    let total = 0;

    session.currentCart.forEach((cartItem, index) => {
      const itemTotal = cartItem.price * cartItem.quantity;
      total += itemTotal;
      cartText += `${index + 1}. ${cartItem.name} x${cartItem.quantity} - €${itemTotal.toFixed(2)}\n`;
    });

    cartText += `\n💰 *Total: €${total.toFixed(2)}*\n\n`;
    cartText += `Ready to order? Type:\n• "checkout" to place order\n• "add" to add more items\n• "remove [number]" to remove item`;

    session.step = 'cart_review';

    return [await this.sendTextMessage(phoneNumber, cartText)];
  }

  private async handleCartReview(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    if (userMessage === 'checkout' || userMessage.includes('order') || userMessage === 'confirm') {
      session.step = 'customer_info';
      
      if (!session.preferences.name) {
        return [await this.sendTextMessage(
          phoneNumber,
          `📝 To complete your order, I'll need your name.\n\nWhat name should I put for this order?`
        )];
      } else {
        return await this.proceedToPayment(phoneNumber, session);
      }
    }

    if (userMessage === 'add' || userMessage.includes('more')) {
      session.step = 'menu_browsing';
      return [await this.sendTextMessage(
        phoneNumber,
        `What else would you like to add? Type an item name or "menu" to see all options.`
      )];
    }

    // Handle item removal
    if (userMessage.startsWith('remove')) {
      const parts = userMessage.split(' ');
      const itemIndex = parseInt(parts[1]) - 1;
      
      if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < session.currentCart.length) {
        const removedItem = session.currentCart.splice(itemIndex, 1)[0];
        
        return [await this.sendTextMessage(
          phoneNumber,
          `✅ Removed ${removedItem.name} from your cart.\n\nType "cart" to see updated order or "checkout" when ready.`
        )];
      }
    }

    return [await this.sendTextMessage(
      phoneNumber,
      `I can help you with your cart! Try:\n• "checkout" - Place your order\n• "add" - Add more items\n• "remove [number]" - Remove item\n• "cart" - See current order`
    )];
  }

  private async handleCustomerInfo(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    // Collect customer name
    if (!session.preferences.name && userMessage.trim().length > 0) {
      session.preferences.name = userMessage.trim();
      return await this.proceedToPayment(phoneNumber, session);
    }

    return [await this.sendTextMessage(
      phoneNumber,
      "Please provide your name for the order."
    )];
  }

  private async proceedToPayment(phoneNumber: string, session: CustomerSession): Promise<any[]> {
    // Get vendor information
    const { data: vendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', session.vendorId!)
      .single();

    if (!vendor) {
      return [await this.sendErrorMessage(phoneNumber)];
    }

    // Calculate total
    const total = session.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const responses = [];

    // Order summary
    responses.push(await this.sendTextMessage(
      phoneNumber,
      `💳 *Payment & Pickup*\n\n📍 *${vendor.name}*\n👤 *Name:* ${session.preferences.name}\n💰 *Total: €${total.toFixed(2)}*\n\nPayment options:`
    ));

    // Payment buttons
    const paymentButtons = [
      {
        type: "reply",
        reply: { id: 'pay_revolut', title: '💳 Revolut' }
      },
      {
        type: "reply", 
        reply: { id: 'pay_cash', title: '💵 Cash at pickup' }
      }
    ];

    responses.push(await this.sendInteractiveMessage(
      phoneNumber,
      'Choose payment method:',
      'How would you like to pay?',
      paymentButtons
    ));

    session.step = 'payment';
    return responses;
  }

  private async handlePayment(
    phoneNumber: string, 
    userMessage: string, 
    session: CustomerSession
  ): Promise<any[]> {
    if (userMessage.startsWith('pay_')) {
      const paymentMethod = userMessage.replace('pay_', '');
      return await this.processPayment(phoneNumber, session, paymentMethod);
    }

    return [await this.sendTextMessage(
      phoneNumber,
      "Please select a payment method."
    )];
  }

  private async processPayment(
    phoneNumber: string, 
    session: CustomerSession, 
    paymentMethod: string
  ): Promise<any[]> {
    try {
      // Create order in database
      const orderData = {
        vendor_id: session.vendorId,
        customer_phone: phoneNumber,
        customer_name: session.preferences.name,
        items: session.currentCart,
        total_amount: session.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        payment_method: paymentMethod,
        order_status: 'confirmed',
        payment_status: paymentMethod === 'cash' ? 'pending' : 'processing',
        whatsapp_order: true,
        created_at: new Date().toISOString()
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      session.step = 'confirmation';
      session.orderHistory.push(order.id);

      const responses = [];

      if (paymentMethod === 'revolut') {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('revolut_link')
          .eq('id', session.vendorId!)
          .single();

        if (vendor?.revolut_link) {
          responses.push(await this.sendTextMessage(
            phoneNumber,
            `💳 Please complete payment via Revolut:\n\n${vendor.revolut_link}\n\nOnce payment is confirmed, your order will be prepared!`
          ));
        }
      }

      // Order confirmation
      responses.push(await this.sendTextMessage(
        phoneNumber,
        `✅ *Order Confirmed!*\n\n🆔 Order #${order.id.substring(0, 8).toUpperCase()}\n👤 Name: ${session.preferences.name}\n⏱️ Estimated time: 15-20 minutes\n\n📞 The restaurant will contact you when ready for pickup.\n\nThank you for using ICUPA Malta! 🇲🇹`
      ));

      // Clear cart
      session.currentCart = [];
      session.step = 'greeting';

      return responses;

    } catch (error) {
      console.error('Error processing payment:', error);
      return [await this.sendErrorMessage(phoneNumber)];
    }
  }

  // Utility methods for sending messages
  private async sendTextMessage(phoneNumber: string, text: string): Promise<any> {
    const response = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: text }
      })
    });

    const result = await response.json();
    
    // Log outgoing message
    await this.logMessage(phoneNumber, text, 'outgoing');
    
    return result;
  }

  private async sendInteractiveMessage(
    phoneNumber: string, 
    text: string, 
    buttonText: string, 
    buttons: any[]
  ): Promise<any> {
    const response = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text },
          action: { buttons }
        }
      })
    });

    return await response.json();
  }

  private async sendHelpMessage(phoneNumber: string): Promise<any[]> {
    return [await this.sendTextMessage(
      phoneNumber,
      `🤖 *ICUPA Malta AI Assistant Help*\n\nI can help you:\n\n🍽️ Browse restaurant menus\n🛒 Add items to cart\n💳 Place orders\n📞 Get recommendations\n\n*Commands:*\n• "start" - Begin ordering\n• "menu" - Browse items\n• "cart" - View current order\n• "help" - Show this help\n\nJust chat with me naturally - I understand what you need! 😊`
    )];
  }

  private async sendErrorMessage(phoneNumber: string): Promise<any[]> {
    return [await this.sendTextMessage(
      phoneNumber,
      "I'm sorry, I encountered an error. Please try again or type 'help' for assistance."
    )];
  }

  private async logMessage(
    phoneNumber: string, 
    message: string, 
    direction: 'incoming' | 'outgoing',
    vendorId?: string
  ): Promise<void> {
    try {
      await supabase.from('whatsapp_logs').insert({
        phone_number: phoneNumber,
        vendor_id: vendorId,
        direction,
        message,
        status: 'sent',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log WhatsApp message:', error);
    }
  }
}

// Main handler
serve(async (req) => {
  try {
    const url = new URL(req.url);
    
    // Handle WhatsApp webhook verification
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      
      return new Response('Forbidden', { status: 403 });
    }

    // Handle incoming WhatsApp messages
    if (req.method === 'POST') {
      const body = await req.json();

      if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
        const messages = body.entry[0].changes[0].value.messages;
        const agent = new WhatsAppAIAgent();

        for (const message of messages) {
          const whatsappMessage: WhatsAppMessage = {
            from: message.from,
            id: message.id,
            timestamp: message.timestamp,
            text: message.text,
            type: message.type
          };

          await agent.processMessage(whatsappMessage);
        }
      }

      return new Response('OK', { status: 200 });
    }

    return new Response('Method not allowed', { status: 405 });
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}); 
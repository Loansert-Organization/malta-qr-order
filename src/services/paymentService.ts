// Payment Service for Malta QR Order platform
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaymentSchema, ValidatedPayment } from '@/lib/security';

// =============================================================================
// PAYMENT SERVICE CONFIGURATION
// =============================================================================

interface PaymentServiceConfig {
  enableLogging: boolean;
  retryAttempts: number;
  timeout: number;
}

const DEFAULT_CONFIG: PaymentServiceConfig = {
  enableLogging: import.meta.env.DEV,
  retryAttempts: 3,
  timeout: 30000,
};

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'GBP';
  paymentMethod: 'revolut' | 'momo' | 'stripe' | 'cash';
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  redirectUrl?: string;
  momoCode?: string;
  revolutLink?: string;
  error?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  completedAt?: string;
  failureReason?: string;
}

// =============================================================================
// PAYMENT SERVICE CLASS
// =============================================================================

export class PaymentService {
  private config: PaymentServiceConfig;

  constructor(config: Partial<PaymentServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // =============================================================================
  // CORE PAYMENT FUNCTION CALLER
  // =============================================================================

  private async callPaymentFunction<T>(
    functionName: string,
    payload: Record<string, unknown>,
    retryCount = 0
  ): Promise<T> {
    try {
      if (this.config.enableLogging) {
        console.log(`💳 Calling payment function: ${functionName}`, payload);
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(`Payment function error: ${error.message}`);
      }

      if (this.config.enableLogging) {
        console.log(`✅ Payment function ${functionName} response:`, data);
      }

      return data as T;
    } catch (error) {
      if (retryCount < this.config.retryAttempts) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callPaymentFunction(functionName, payload, retryCount + 1);
      }

      console.error(`❌ Payment function ${functionName} failed after ${retryCount + 1} retries:`, error);
      throw error;
    }
  }

  // =============================================================================
  // PAYMENT PROCESSING
  // =============================================================================

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate payment request
      const validatedPayment: ValidatedPayment = {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        payment_method: paymentRequest.paymentMethod,
        order_id: paymentRequest.orderId,
      };

      // Validate using schema
      PaymentSchema.parse(validatedPayment);

      let response: PaymentResponse;

      switch (paymentRequest.paymentMethod) {
        case 'revolut':
          response = await this.processRevolutPayment(paymentRequest);
          break;
        case 'momo':
          response = await this.processMoMoPayment(paymentRequest);
          break;
        case 'stripe':
          response = await this.processStripePayment(paymentRequest);
          break;
        case 'cash':
          response = await this.processCashPayment(paymentRequest);
          break;
        default:
          throw new Error(`Unsupported payment method: ${paymentRequest.paymentMethod}`);
      }

      return response;
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error('Payment processing failed. Please try again.');
      throw error;
    }
  }

  // =============================================================================
  // PAYMENT METHOD HANDLERS
  // =============================================================================

  private async processRevolutPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.callPaymentFunction('verify-revolut-payment', {
      order_id: paymentRequest.orderId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      customer_info: paymentRequest.customerInfo,
      metadata: paymentRequest.metadata || {},
      timestamp: new Date().toISOString(),
    });

    return {
      success: response.success || false,
      paymentId: response.payment_id || `rev_${Date.now()}`,
      status: response.status || 'pending',
      revolutLink: response.revolut_link,
      error: response.error,
    };
  }

  private async processMoMoPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.callPaymentFunction('create-stripe-payment', {
      order_id: paymentRequest.orderId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      payment_method: 'mobile_money',
      customer_info: paymentRequest.customerInfo,
      metadata: {
        ...paymentRequest.metadata,
        country: 'Rwanda',
        provider: 'MoMo',
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: response.success || false,
      paymentId: response.payment_id || `momo_${Date.now()}`,
      status: response.status || 'pending',
      momoCode: response.momo_code,
      error: response.error,
    };
  }

  private async processStripePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.callPaymentFunction('create-stripe-payment', {
      order_id: paymentRequest.orderId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      payment_method: 'card',
      customer_info: paymentRequest.customerInfo,
      metadata: paymentRequest.metadata || {},
      timestamp: new Date().toISOString(),
    });

    return {
      success: response.success || false,
      paymentId: response.payment_id || `stripe_${Date.now()}`,
      status: response.status || 'pending',
      redirectUrl: response.redirect_url,
      error: response.error,
    };
  }

  private async processCashPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    // For cash payments, we just record the payment
    const response = await this.callPaymentFunction('verify-payment-status', {
      order_id: paymentRequest.orderId,
      payment_method: 'cash',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'completed',
      metadata: {
        ...paymentRequest.metadata,
        payment_type: 'cash_on_delivery',
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      paymentId: response.payment_id || `cash_${Date.now()}`,
      status: 'completed',
    };
  }

  // =============================================================================
  // PAYMENT STATUS CHECKING
  // =============================================================================

  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await this.callPaymentFunction('verify-payment-status', {
        payment_id: paymentId,
        timestamp: new Date().toISOString(),
      });

      return {
        paymentId: response.payment_id || paymentId,
        status: response.status || 'pending',
        amount: response.amount || 0,
        currency: response.currency || 'EUR',
        completedAt: response.completed_at,
        failureReason: response.failure_reason,
      };
    } catch (error) {
      console.error('Failed to check payment status:', error);
      throw error;
    }
  }

  // =============================================================================
  // PAYMENT REFUNDS
  // =============================================================================

  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const response = await this.callPaymentFunction('verify-payment-status', {
        payment_id: paymentId,
        action: 'refund',
        refund_amount: amount,
        refund_reason: reason,
        timestamp: new Date().toISOString(),
      });

      return {
        success: response.success || false,
        refundId: response.refund_id,
        error: response.error,
      };
    } catch (error) {
      console.error('Failed to refund payment:', error);
      return {
        success: false,
        error: 'Refund processing failed',
      };
    }
  }

  // =============================================================================
  // PAYMENT ANALYTICS
  // =============================================================================

  async getPaymentAnalytics(
    vendorId: string,
    dateRange: { start: string; end: string }
  ): Promise<{
    totalPayments: number;
    totalAmount: number;
    successRate: number;
    paymentMethods: Record<string, number>;
    dailyBreakdown: Array<{ date: string; amount: number; count: number }>;
  }> {
    try {
      const response = await this.callPaymentFunction('vendor-analytics', {
        vendor_id: vendorId,
        analytics_type: 'payments',
        date_range: dateRange,
        timestamp: new Date().toISOString(),
      });

      return {
        totalPayments: response.total_payments || 0,
        totalAmount: response.total_amount || 0,
        successRate: response.success_rate || 0,
        paymentMethods: response.payment_methods || {},
        dailyBreakdown: response.daily_breakdown || [],
      };
    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      return {
        totalPayments: 0,
        totalAmount: 0,
        successRate: 0,
        paymentMethods: {},
        dailyBreakdown: [],
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  validatePaymentMethod(method: string): boolean {
    const validMethods = ['revolut', 'momo', 'stripe', 'cash'];
    return validMethods.includes(method);
  }

  getSupportedCurrencies(): string[] {
    return ['EUR', 'USD', 'GBP'];
  }

  getSupportedPaymentMethods(country?: string): string[] {
    if (country === 'Rwanda') {
      return ['momo', 'cash'];
    }
    if (country === 'Malta') {
      return ['revolut', 'stripe', 'cash'];
    }
    return ['revolut', 'momo', 'stripe', 'cash'];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const paymentService = new PaymentService();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export const processPayment = paymentService.processPayment.bind(paymentService);
export const checkPaymentStatus = paymentService.checkPaymentStatus.bind(paymentService);
export const refundPayment = paymentService.refundPayment.bind(paymentService);
export const getPaymentAnalytics = paymentService.getPaymentAnalytics.bind(paymentService); 
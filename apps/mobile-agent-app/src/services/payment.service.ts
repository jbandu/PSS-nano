import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import Config from 'react-native-config';
import { Payment, PaymentMethod, PaymentStatus } from '@/types';
import apiService from './api.service';

class PaymentService {
  private stripeTerminal: any = null;
  private connectedReader: any = null;

  async initialize(): Promise<void> {
    if (!Config.STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Stripe publishable key not configured');
    }

    // Initialize Stripe Terminal SDK
    // This would typically be done in the component using the hook
    console.log('Payment service initialized');
  }

  async discoverReaders(callback: (readers: any[]) => void): Promise<void> {
    // Discovery of Stripe readers would be implemented here
    // Using the useStripeTerminal hook in components
    console.log('Discovering payment readers...');
  }

  async connectToReader(readerId: string): Promise<void> {
    try {
      // Connect to Stripe Terminal reader
      console.log(`Connecting to reader: ${readerId}`);
      // Implementation using Stripe Terminal SDK
    } catch (error) {
      console.error('Failed to connect to reader:', error);
      throw error;
    }
  }

  async processPayment(
    amount: number,
    currency: string = 'USD',
    description: string,
    metadata?: Record<string, string>
  ): Promise<Payment> {
    try {
      // Create payment intent on backend
      const response = await apiService.createPaymentIntent({
        amount,
        currency,
        description,
        metadata,
      });

      const paymentIntent = response.data.data;

      // Collect payment method using Terminal SDK
      // This would use the Stripe Terminal SDK to collect card payment
      // const result = await stripeTerminal.collectPaymentMethod({
      //   paymentIntentId: paymentIntent.id,
      // });

      // Process payment
      // const processResult = await stripeTerminal.processPayment();

      // Capture payment on backend
      await apiService.capturePayment(paymentIntent.id);

      const payment: Payment = {
        id: paymentIntent.id,
        amount,
        currency,
        paymentMethod: 'card',
        status: 'captured',
        transactionId: paymentIntent.id,
        receiptNumber: paymentIntent.receiptNumber,
      };

      return payment;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  async processCashPayment(
    amount: number,
    currency: string = 'USD',
    description: string
  ): Promise<Payment> {
    // Record cash payment
    const payment: Payment = {
      id: `cash_${Date.now()}`,
      amount,
      currency,
      paymentMethod: 'cash',
      status: 'captured',
      receiptNumber: `CASH${Date.now()}`,
    };

    // Log cash payment to backend
    try {
      await apiService.createPaymentIntent({
        amount,
        currency,
        description,
        paymentMethod: 'cash',
      });
    } catch (error) {
      console.error('Failed to log cash payment:', error);
    }

    return payment;
  }

  async processVoucherPayment(
    voucherCode: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<Payment> {
    try {
      const response = await apiService.createPaymentIntent({
        amount,
        currency,
        paymentMethod: 'voucher',
        voucherCode,
      });

      const payment: Payment = {
        id: response.data.data.id,
        amount,
        currency,
        paymentMethod: 'voucher',
        status: 'captured',
        transactionId: voucherCode,
      };

      return payment;
    } catch (error) {
      console.error('Voucher payment failed:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId: string): Promise<void> {
    try {
      // Cancel payment intent
      // await stripeTerminal.cancelCollectPaymentMethod();
      console.log(`Cancelled payment: ${paymentId}`);
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      throw error;
    }
  }

  async disconnectReader(): Promise<void> {
    if (this.connectedReader) {
      // Disconnect from reader
      // await stripeTerminal.disconnectReader();
      this.connectedReader = null;
    }
  }

  isReaderConnected(): boolean {
    return this.connectedReader !== null;
  }

  getConnectedReaderInfo(): any {
    return this.connectedReader;
  }

  async getReaderBatteryLevel(): Promise<number | null> {
    if (!this.connectedReader) return null;

    try {
      // Get battery level from reader
      // return await stripeTerminal.getReaderBatteryLevel();
      return null;
    } catch (error) {
      return null;
    }
  }
}

export default new PaymentService();

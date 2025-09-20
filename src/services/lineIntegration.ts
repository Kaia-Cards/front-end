import liff from '@line/liff';
import { lineService } from './lineService';

interface LineFlexMessage {
  type: 'flex';
  altText: string;
  contents: any;
}

interface LinePurchaseNotification {
  orderId: string;
  shopName: string;
  amount: number;
  price: number;
  cardCode?: string;
}

class LineIntegration {
  async sendPurchaseConfirmation(purchase: LinePurchaseNotification): Promise<void> {
    const message: LineFlexMessage = {
      type: 'flex',
      altText: `Gift Card Purchase Confirmation - ${purchase.shopName}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🎁 Purchase Confirmed',
              weight: 'bold',
              color: '#FFFFFF',
              size: 'lg'
            }
          ],
          backgroundColor: '#7c3aed',
          paddingAll: '15px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: purchase.shopName,
              weight: 'bold',
              size: 'xl',
              margin: 'md'
            },
            {
              type: 'text',
              text: `$${purchase.amount} Gift Card`,
              size: 'lg',
              color: '#555555',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'Order ID:',
                      size: 'sm',
                      color: '#555555',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: purchase.orderId,
                      size: 'sm',
                      color: '#111111',
                      align: 'end'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'Amount:',
                      size: 'sm',
                      color: '#555555',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: `$${purchase.amount}`,
                      size: 'sm',
                      color: '#111111',
                      align: 'end'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'Paid:',
                      size: 'sm',
                      color: '#555555',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: `${purchase.price} USDT`,
                      size: 'sm',
                      color: '#111111',
                      align: 'end'
                    }
                  ]
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'View Order',
                uri: `${window.location.origin}#orders`
              },
              color: '#7c3aed'
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'Buy More Cards',
                uri: window.location.origin
              }
            }
          ]
        }
      }
    };

    try {
      await liff.sendMessages([message]);
    } catch (error) {
      console.error('Failed to send purchase confirmation:', error);
    }
  }

  async sendCardDelivery(purchase: LinePurchaseNotification): Promise<void> {
    const message: LineFlexMessage = {
      type: 'flex',
      altText: `Gift Card Delivered - ${purchase.shopName}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '✅ Card Delivered',
              weight: 'bold',
              color: '#FFFFFF',
              size: 'lg'
            }
          ],
          backgroundColor: '#10b981',
          paddingAll: '15px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: purchase.shopName,
              weight: 'bold',
              size: 'xl',
              margin: 'md'
            },
            {
              type: 'text',
              text: 'Your gift card is ready to use!',
              size: 'md',
              color: '#555555',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            ...(purchase.cardCode ? [{
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              contents: [
                {
                  type: 'text',
                  text: 'Gift Card Code:',
                  size: 'sm',
                  color: '#555555'
                },
                {
                  type: 'text',
                  text: purchase.cardCode,
                  weight: 'bold',
                  size: 'lg',
                  color: '#10b981',
                  margin: 'xs'
                }
              ]
            }] : [])
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'View Card Details',
                uri: `${window.location.origin}#orders`
              },
              color: '#10b981'
            }
          ]
        }
      }
    };

    try {
      await liff.sendMessages([message]);
    } catch (error) {
      console.error('Failed to send card delivery notification:', error);
    }
  }

  async setupRichMenu(): Promise<void> {
    try {
      const richMenuData = {
        size: {
          width: 2500,
          height: 1686
        },
        selected: true,
        name: 'KaiaCards Menu',
        chatBarText: 'Menu',
        areas: [
          {
            bounds: {
              x: 0,
              y: 0,
              width: 833,
              height: 843
            },
            action: {
              type: 'uri',
              uri: window.location.origin
            }
          },
          {
            bounds: {
              x: 833,
              y: 0,
              width: 834,
              height: 843
            },
            action: {
              type: 'uri',
              uri: `${window.location.origin}#orders`
            }
          },
          {
            bounds: {
              x: 1667,
              y: 0,
              width: 833,
              height: 843
            },
            action: {
              type: 'uri',
              uri: `${window.location.origin}#profile`
            }
          },
          {
            bounds: {
              x: 0,
              y: 843,
              width: 1250,
              height: 843
            },
            action: {
              type: 'message',
              text: 'Show popular brands'
            }
          },
          {
            bounds: {
              x: 1250,
              y: 843,
              width: 1250,
              height: 843
            },
            action: {
              type: 'message',
              text: 'Get support'
            }
          }
        ]
      };

      console.log('Rich menu configured:', richMenuData);
    } catch (error) {
      console.error('Failed to setup rich menu:', error);
    }
  }

  async shareOrder(orderId: string, shopName: string, amount: number): Promise<void> {
    const shareMessage = `🎁 I just bought a $${amount} ${shopName} gift card on KaiaCards!

💳 Secure crypto payments
⚡ Instant delivery
🛡️ 100% authentic cards

Check it out: ${window.location.origin}`;

    try {
      await lineService.shareTargetPicker(shareMessage);
    } catch (error) {
      console.error('Failed to share order:', error);
      throw error;
    }
  }

  async requestLinePayment(amount: number, currency: string = 'USD'): Promise<void> {
    if (!liff.isInClient()) {
      throw new Error('LINE Pay is only available in LINE app');
    }

    console.log(`Initiating LINE Pay for ${amount} ${currency}`);

    try {
      await liff.sendMessages([{
        type: 'text',
        text: `💳 Payment Request: ${amount} ${currency}\n\nPlease complete your payment to continue with your gift card purchase.`
      }]);
    } catch (error) {
      console.error('Failed to initiate LINE Pay:', error);
      throw error;
    }
  }

  async sendWelcomeMessage(): Promise<void> {
    const welcomeMessage = `🎉 Welcome to KaiaCards!

Your one-stop shop for premium gift cards with crypto payments.

🔹 500+ Global Brands
🔹 USDT Payments on Kaia Network
🔹 Flash Delivery
🔹 100% Authentic Cards

Ready to start shopping? 🛒`;

    try {
      await liff.sendMessages([{
        type: 'text',
        text: welcomeMessage
      }]);
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  }
}

export const lineIntegration = new LineIntegration();
export type { LinePurchaseNotification };
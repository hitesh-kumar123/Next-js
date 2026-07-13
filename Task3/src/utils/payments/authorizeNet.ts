interface CardDetails {
  cardNumber: string
  expirationDate: string // MMYY or MM/YY or YYYY-MM
  cardCode: string // CVV
}

interface CustomerDetails {
  email: string
  firstName: string
  lastName: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
}

const AUTHORIZE_NET_URL = 'https://apitest.authorize.net/xml/v1/request.api'

function formatExpirationDate(expiry: string): string {
  // Cleans the date to MMYY format
  const cleaned = expiry.replace(/\D/g, '')
  if (cleaned.length === 4) {
    return cleaned // already MMYY
  }
  if (cleaned.length === 6) {
    // YYYYMM -> MMYY
    return cleaned.slice(4, 6) + cleaned.slice(2, 4)
  }
  return cleaned
}

export async function chargeCard(
  card: CardDetails,
  amount: number,
  productName: string,
  customer: CustomerDetails
) {
  const loginId = process.env.AUTHORIZE_NET_API_LOGIN_ID
  const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY

  if (!loginId || !transactionKey) {
    console.warn('Payment gateway environment keys missing. Falling back to Mock Payment Success in local development.')
    return {
      success: true,
      transactionId: `mock-tx-${Date.now()}`,
    }
  }

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: loginId,
        transactionKey: transactionKey,
      },
      refId: `ref-${Date.now()}`,
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: amount.toFixed(2),
        payment: {
          creditCard: {
            cardNumber: card.cardNumber.replace(/\s/g, ''),
            expirationDate: formatExpirationDate(card.expirationDate),
            cardCode: card.cardCode,
          },
        },
        lineItems: {
          lineItem: {
            itemId: '1',
            name: productName.slice(0, 31), // Authorize.net limits name to 31 chars
            description: `Purchase of ${productName}`,
            quantity: '1',
            unitPrice: amount.toFixed(2),
          },
        },
        customer: {
          email: customer.email,
        },
        billTo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          address: customer.address || '123 Main St',
          city: customer.city || 'Gymtown',
          state: customer.state || 'CA',
          zip: customer.zip || '90210',
          country: 'USA',
          phoneNumber: customer.phone || '',
        },
      },
    },
  }

  try {
    const response = await fetch(AUTHORIZE_NET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    // Authorize.net returns a JSON string, but sometimes it starts with BOM or formatting
    const cleanedText = text.trim().replace(/^\uFEFF/, '')
    const data = JSON.parse(cleanedText)

    if (data?.messages?.resultCode === 'Error') {
      return {
        success: false,
        error: data.messages.message[0].text || 'Payment processing failed.',
      }
    }

    const transactionResponse = data?.transactionResponse
    if (transactionResponse?.errors) {
      return {
        success: false,
        error: transactionResponse.errors.error[0].errorText || 'Payment declined.',
      }
    }

    if (transactionResponse?.responseCode === '1') {
      return {
        success: true,
        transactionId: transactionResponse.transId,
      }
    }

    return {
      success: false,
      error: 'Payment was not approved. Response code: ' + (transactionResponse?.responseCode || 'unknown'),
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Payment gateway connection error.',
    }
  }
}

export async function createARBSubscription(
  card: CardDetails,
  amount: number,
  productName: string,
  customer: CustomerDetails,
  durationMonths?: number
) {
  const loginId = process.env.AUTHORIZE_NET_API_LOGIN_ID
  const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY

  if (!loginId || !transactionKey) {
    console.warn('Payment gateway environment keys missing. Falling back to Mock Subscription Success in local development.')
    return {
      success: true,
      subscriptionId: `mock-sub-${Date.now()}`,
    }
  }

  const today = new Date().toISOString().split('T')[0]
  // Default total occurrences: 9999 for ongoing, or durationMonths if limited
  const occurrences = durationMonths && durationMonths > 0 ? durationMonths.toString() : '9999'

  const payload = {
    ARBCreateSubscriptionRequest: {
      merchantAuthentication: {
        name: loginId,
        transactionKey: transactionKey,
      },
      refId: `ref-${Date.now()}`,
      subscription: {
        name: productName.slice(0, 50),
        paymentSchedule: {
          interval: {
            length: '1',
            unit: 'months',
          },
          startDate: today,
          totalOccurrences: occurrences,
          trialOccurrences: '0',
        },
        amount: amount.toFixed(2),
        trialAmount: '0.00',
        payment: {
          creditCard: {
            cardNumber: card.cardNumber.replace(/\s/g, ''),
            expirationDate: formatExpirationDate(card.expirationDate),
            cardCode: card.cardCode,
          },
        },
        billTo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          address: customer.address || '123 Main St',
          city: customer.city || 'Gymtown',
          state: customer.state || 'CA',
          zip: customer.zip || '90210',
        },
      },
    },
  }

  try {
    const response = await fetch(AUTHORIZE_NET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    const cleanedText = text.trim().replace(/^\uFEFF/, '')
    const data = JSON.parse(cleanedText)

    if (data?.messages?.resultCode === 'Error') {
      return {
        success: false,
        error: data.messages.message[0].text || 'Subscription creation failed.',
      }
    }

    if (data?.subscriptionId) {
      return {
        success: true,
        subscriptionId: data.subscriptionId,
      }
    }

    return {
      success: false,
      error: 'Failed to create subscription profile.',
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Payment gateway connection error.',
    }
  }
}

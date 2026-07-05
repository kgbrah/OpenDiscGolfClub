# PayPal Membership Setup

PayPal is optional. If you do not add payment config, OpenDiscGolfClub still renders membership benefits and contact instructions.

## Hosted Checkout URL

Use this when you already have a PayPal button or hosted checkout link:

```json
{
  "membership": {
    "payment": {
      "provider": "paypal",
      "checkoutUrl": "https://www.paypal.com/ncp/payment/..."
    }
  }
}
```

## Classic Email Checkout

Use this for a simple fixed-price annual membership:

```json
{
  "membership": {
    "priceLabel": "$15 / Year",
    "payment": {
      "provider": "paypal",
      "businessEmail": "club@example.com",
      "amount": 15,
      "itemName": "Club Membership"
    }
  }
}
```


# @adkit.so/meta-pixel

Platform-agnostic Meta Pixel tracking wrapper with full TypeScript support.

## Installation

```bash
npm install @adkit.so/meta-pixel
```

## Usage

### Basic Setup

```typescript
// Option 1: Default import
import META from '@adkit.so/meta-pixel';

// Option 2: Named import
import { META } from '@adkit.so/meta-pixel';

// Initialize with a single pixel ID
META.init({
    pixelIds: 'YOUR_PIXEL_ID',
});

// Or initialize with multiple pixel IDs
META.init({
    pixelIds: ['PIXEL_ID_1', 'PIXEL_ID_2'],
    autoTrackPageView: true, // default: true
    debug: true, // Enable styled console logs
    enableLocalhost: true, // Allow tracking on localhost for testing (default: false)
});
```

### Tracking Events

```typescript
// Track a standard event
META.track('AddToCart', {
    value: 29.99,
    currency: 'USD',
    content_ids: ['SKU_123'],
    content_type: 'product',
});

// Track another standard event
META.track('Purchase', {
    value: 99.99,
    currency: 'USD',
    content_ids: ['ORDER_456'],
});

// Track a custom event (use trackCustom for better practice)
META.trackCustom('CustomEventName', {
    custom_param: 'value',
});
```

### Advanced Usage

```typescript
// With event deduplication
META.track('Purchase', 
    {
        value: 99.99,
        currency: 'USD',
    },
    {
        eventID: 'unique-event-id-123',
    }
);

// Check if pixel is loaded
if (META.isLoaded()) {
    META.track('ViewContent');
}

// Create a separate instance
import { createMetaPixel } from '@adkit.so/meta-pixel';

const customPixel = createMetaPixel();
customPixel.init({ pixelIds: 'ANOTHER_PIXEL_ID' });
customPixel.track('Lead');
```

## API

### `META.init(config: MetaPixelConfig): void`

Initialize the Meta Pixel with configuration.

**Config Options:**
- `pixelIds` (required): Single pixel ID string or array of pixel IDs
- `autoTrackPageView` (optional): Whether to track PageView on initialization (default: `true`)
- `debug` (optional): Enable styled debug logging in console (default: `false`)
- `enableLocalhost` (optional): Enable tracking on localhost (default: `false`)

**Debug Mode:**

When `debug: true`, you'll see styled console logs with background colors and white text:
- 🔵 **Info** (blue background): Initialization and tracking events
- ✅ **Success** (green background): Successful initialization
- ⚠️ **Warning** (orange background): Warnings and errors
- Example: **[Meta Pixel]** Initializing Meta Pixel...

### `META.track(event: StandardEvent | string, data?: EventData, eventData?: EventMetaData): void`

Track a standard event. If you pass a custom event name, it will still work but show a warning recommending to use `trackCustom()` instead.

### `META.trackCustom(event: string, data?: EventData, eventData?: EventMetaData): void`

Explicitly track a custom event.

### `META.isLoaded(): boolean`

Check if the Meta Pixel script is loaded and ready.

## Standard Events

The following standard Facebook Pixel events are supported:

- `AddPaymentInfo`
- `AddToCart`
- `AddToWishlist`
- `CompleteRegistration`
- `Contact`
- `CustomizeProduct`
- `Donate`
- `FindLocation`
- `InitiateCheckout`
- `Lead`
- `Purchase`
- `Schedule`
- `Search`
- `StartTrial`
- `SubmitApplication`
- `Subscribe`
- `ViewContent`

## Event Data Parameters

Common event data parameters:

- `value`: The value of the event
- `currency`: Currency code (e.g., 'USD')
- `content_ids`: Array of product IDs/SKUs
- `content_type`: 'product' or 'product_group'
- `content_name`: Name of the page/product
- `content_category`: Category of the page/product
- `contents`: Array of `{ id, quantity }` objects
- `num_items`: Number of items
- `search_string`: Search query string
- `status`: Registration status
- `predicted_ltv`: Predicted lifetime value

## TypeScript Support

This package is written in TypeScript and includes full type definitions. All types are exported:

```typescript
import type { 
    StandardEvent, 
    EventData, 
    EventMetaData, 
    MetaPixelConfig,
    MetaPixelInterface 
} from '@adkit.so/meta-pixel';
```

## License

MIT


import type { StandardEvent, EventData, EventMetaData, MetaPixelConfig, MetaPixelInterface } from './types';

export type { StandardEvent, EventData, EventMetaData, MetaPixelConfig, MetaPixelInterface } from './types';

/**
 * Logger utility for styled console output
 */
const logger = {
    info: (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #1877f2; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #1877f2; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    warn: (message: string, data?: any) => {
        if (data !== undefined) {
            console.warn(`%c[Meta Pixel]%c ${message}`, 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.warn(`%c[Meta Pixel]%c ${message}`, 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    success: (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.log(`%c[Meta Pixel]%c ${message}`, 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
    error: (message: string, data?: any) => {
        if (data !== undefined) {
            console.error(`%c[Meta Pixel]%c ${message}`, 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;', data);
        } else {
            console.error(`%c[Meta Pixel]%c ${message}`, 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 'color: inherit;');
        }
    },
};

/**
 * List of standard Facebook Pixel events
 */
const STANDARD_EVENTS: StandardEvent[] = ['PageView', 'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration', 'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout', 'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication', 'Subscribe', 'ViewContent'];

/**
 * Check if an event is a standard Facebook Pixel event
 */
function isStandardEvent(event: string): event is StandardEvent {
    return STANDARD_EVENTS.includes(event as StandardEvent);
}

/**
 * Meta Pixel class implementation
 */
class MetaPixel implements MetaPixelInterface {
    private initialized = false;
    private config: MetaPixelConfig | null = null;

    /**
     * Initialize Meta Pixel with configuration
     */
    init(config: MetaPixelConfig): void {
        if (this.initialized) {
            logger.warn('Already initialized');
            return;
        }

        this.config = {
            autoTrackPageView: true,
            debug: false,
            enableLocalhost: false,
            ...config,
        };

        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            if (this.config.debug) logger.warn('Not in browser environment, skipping initialization');
            return;
        }

        // Check if we're on localhost and should disable tracking
        if (!this.config.enableLocalhost && window.location.hostname === 'localhost') {
            if (this.config.debug) logger.info('Disabled on localhost (set enableLocalhost: true to enable for testing)');
            return;
        }

        // Normalize pixelIds to array
        const pixelIds = Array.isArray(config.pixelIds) ? config.pixelIds : [config.pixelIds];

        if (!pixelIds.length || pixelIds.every((id) => !id)) {
            logger.warn('No pixel IDs provided');
            return;
        }

        if (this.config.debug) logger.info('Initializing Meta Pixel...', { pixelIds, autoTrackPageView: this.config.autoTrackPageView });

        // Load Facebook Pixel script
        this.loadScript(pixelIds);

        this.initialized = true;

        if (this.config.debug) logger.success('✓ Meta Pixel initialized successfully');
    }

    /**
     * Load the Facebook Pixel script
     */
    private loadScript(pixelIds: string[]): void {
        // Facebook Pixel base code
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;

        const pixelCode = pixelIds
            .filter((id) => id)
            .map((id) => `fbq('init', '${id}');`)
            .join('\n');

        const autoPageView = this.config?.autoTrackPageView ? `fbq('track', 'PageView');` : '';

        script.innerHTML = `
            !(function (f, b, e, v, n, t, s) {
                if (f.fbq) return;
                n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = '2.0';
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            ${pixelCode}
            ${autoPageView}
        `;

        document.head.appendChild(script);
    }

    /**
     * Track a standard event (use trackCustom for custom events)
     */
    track(event: StandardEvent | string, data: EventData = {}, eventData: EventMetaData = {}): void {
        if (!this.isLoaded()) {
            logger.warn(`Event "${event}" not tracked - Pixel not loaded`);
            return;
        }

        if (isStandardEvent(event)) {
            if (this.config?.debug) logger.info(`Tracking standard event: "${event}"`, { data, eventData });
            window.fbq!('track', event, data, eventData);
        } else {
            // Warn user to use trackCustom for custom events
            logger.warn(`"${event}" is not a standard event. Use trackCustom() instead for custom events.`);
            if (this.config?.debug) logger.info(`Tracking custom event: "${event}"`, { data, eventData });
            window.fbq!('trackCustom', event, data, eventData);
        }
    }

    /**
     * Track a custom event
     */
    trackCustom(event: string, data: EventData = {}, eventData: EventMetaData = {}): void {
        if (!this.isLoaded()) {
            logger.warn(`Custom event "${event}" not tracked - Pixel not loaded`);
            return;
        }

        if (this.config?.debug) logger.info(`Tracking custom event: "${event}"`, { data, eventData });

        window.fbq!('trackCustom', event, data, eventData);
    }

    /**
     * Check if Meta Pixel is loaded
     */
    isLoaded(): boolean {
        return typeof window !== 'undefined' && typeof window.fbq === 'function';
    }
}

/**
 * Default Meta Pixel instance
 */
export const META = new MetaPixel();

/**
 * Create a new Meta Pixel instance
 */
export function createMetaPixel(): MetaPixelInterface {
    return new MetaPixel();
}

/**
 * Default export
 */
export default META;

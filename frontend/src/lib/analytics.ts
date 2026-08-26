/**
 * AdaptCode Telemetry & Analytics Wrapper
 * 
 * This module provides a centralized way to track user events.
 * Currently, it logs to the console. In a production environment, 
 * simply initialize PostHog (or Mixpanel) here and map `trackEvent` to `posthog.capture`.
 */

export const Analytics = {
    init: () => {
        // e.g. posthog.init('<ph_project_api_key>', { api_host: 'https://app.posthog.com' })
        if (process.env.NODE_ENV !== 'test') {
            console.log('[Telemetry] Analytics initialized');
        }
    },

    identify: (userId: string, traits: Record<string, any> = {}) => {
        // e.g. posthog.identify(userId, traits)
        if (process.env.NODE_ENV !== 'test') {
            console.log(`[Telemetry] User identified: ${userId}`, traits);
        }
    },

    trackEvent: (eventName: string, properties: Record<string, any> = {}) => {
        // e.g. posthog.capture(eventName, properties)
        if (process.env.NODE_ENV !== 'test') {
            console.log(`[Telemetry] Event Triggered: '${eventName}'`, properties);
        }
    }
};

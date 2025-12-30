import { NODE_ENV, SENTRY_DSN } from '@/config/defaults';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { logger } from './logger';

class SentryWrapper {
    private static instance: SentryWrapper;
    constructor() {
        this.initSentry();
    }

    public static getInstance = (): SentryWrapper => {
        if (!SentryWrapper.instance) {
            SentryWrapper.instance = new SentryWrapper();
        }
        return SentryWrapper.instance;
    };
    public initSentry = () => {
        try {
            if (NODE_ENV === 'test') return;
            Sentry.init({
                dsn: SENTRY_DSN,
                environment: NODE_ENV,
                enabled: NODE_ENV !== 'test',
                integrations: [
                    nodeProfilingIntegration(),
                    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
                ],
                tracesSampleRate: NODE_ENV === 'production' ? 0.2 : 1.0,
                profilesSampleRate: 1.0,
                release: 'oop@1.0.0',
                enableLogs: true,
            });

            logger.info('sentry is connected for monitoring');
        } catch (error: any) {
            logger.error('sentry error:', error.message);
        }
    };
}

SentryWrapper.getInstance().initSentry(); // Initialize Sentry immediately

export default SentryWrapper;

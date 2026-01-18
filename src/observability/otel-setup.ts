import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { metrics, trace, context } from '@opentelemetry/api';

/**
 * Initialize OpenTelemetry instrumentation for distributed tracing and metrics
 * This should be called BEFORE any other imports in your application
 */
export function initializeOpenTelemetry(): NodeSDK | null {
    // Only enable if OTEL_ENABLED is true
    if (process.env.OTEL_ENABLED !== 'true') {
        console.log('OpenTelemetry disabled (OTEL_ENABLED !== true)');
        return null;
    }

    const serviceName = process.env.OTEL_SERVICE_NAME || 'tax-filing-api';
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

    // Trace exporter
    const traceExporter = new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
        headers: {},
    });

    // Metric exporter
    const metricExporter = new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
        headers: {},
    });

    // Metric reader with 5-second export interval
    const metricReader = new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 5000,
    });

    const sdk = new NodeSDK({
        traceExporter,
        metricReader,
        instrumentations: [
            getNodeAutoInstrumentations({
                // Customize instrumentation
                '@opentelemetry/instrumentation-http': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-express': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-pg': {
                    enabled: true,
                },
            }),
        ],
        serviceName,
    });

    sdk.start();
    console.log(`OpenTelemetry initialized for ${serviceName}`);

    // Graceful shutdown
    process.on('SIGTERM', () => {
        sdk.shutdown()
            .then(() => console.log('OpenTelemetry terminated'))
            .catch((error) => console.error('Error terminating OpenTelemetry', error))
            .finally(() => process.exit(0));
    });

    return sdk;
}

/**
 * Custom metrics for tax filing application
 */
const meter = metrics.getMeter('tax-filing-api');

// Tax calculation metrics
export const taxCalculationCounter = meter.createCounter('tax_calculations_total', {
    description: 'Total number of tax calculations performed',
    unit: '1',
});

export const taxCalculationDurationHistogram = meter.createHistogram(
    'tax_calculation_duration_ms',
    {
        description: 'Duration of tax calculation in milliseconds',
        unit: 'ms',
    }
);

export const taxCalculationErrorCounter = meter.createCounter('tax_calculation_errors_total', {
    description: 'Total number of tax calculation errors',
    unit: '1',
});

// E-file submission metrics
export const eFileSubmissionCounter = meter.createCounter('efile_submissions_total', {
    description: 'Total number of e-file submissions',
    unit: '1',
});

export const eFileAcceptanceCounter = meter.createCounter('efile_acceptances_total', {
    description: 'Total number of accepted e-file submissions',
    unit: '1',
});

export const eFileRejectionCounter = meter.createCounter('efile_rejections_total', {
    description: 'Total number of rejected e-file submissions',
    unit: '1',
});

// PDF generation metrics
export const pdfGenerationCounter = meter.createCounter('pdf_generations_total', {
    description: 'Total number of PDF generations',
    unit: '1',
});

export const pdfGenerationDurationHistogram = meter.createHistogram(
    'pdf_generation_duration_ms',
    {
        description: 'Duration of PDF generation in milliseconds',
        unit: 'ms',
    }
);

// User activity metrics
export const userLoginCounter = meter.createCounter('user_logins_total', {
    description: 'Total number of user logins',
    unit: '1',
});

export const userRegistrationCounter = meter.createCounter('user_registrations_total', {
    description: 'Total number of user registrations',
    unit: '1',
});

// Database metrics
export const dbQueryDurationHistogram = meter.createHistogram('db_query_duration_ms', {
    description: 'Database query duration in milliseconds',
    unit: 'ms',
});

export const dbConnectionPoolGauge = meter.createObservableGauge('db_connection_pool_size', {
    description: 'Current database connection pool size',
    unit: '1',
});

/**
 * Helper function to create a span for tracking operations
 */
export function createSpan(name: string, attributes?: Record<string, any>) {
    const tracer = trace.getTracer('tax-filing-api');
    const span = tracer.startSpan(name, {
        attributes,
    });
    return span;
}

/**
 * Helper function to record metrics for tax calculations
 */
export function recordTaxCalculation(duration: number, success: boolean, attributes?: Record<string, any>) {
    taxCalculationCounter.add(1, attributes);
    taxCalculationDurationHistogram.record(duration, attributes);

    if (!success) {
        taxCalculationErrorCounter.add(1, attributes);
    }
}

/**
 * Helper function to record e-file submission metrics
 */
export function recordEFileSubmission(status: 'accepted' | 'rejected', attributes?: Record<string, any>) {
    eFileSubmissionCounter.add(1, attributes);

    if (status === 'accepted') {
        eFileAcceptanceCounter.add(1, attributes);
    } else {
        eFileRejectionCounter.add(1, attributes);
    }
}

/**
 * Helper function to record PDF generation metrics
 */
export function recordPdfGeneration(duration: number, attributes?: Record<string, any>) {
    pdfGenerationCounter.add(1, attributes);
    pdfGenerationDurationHistogram.record(duration, attributes);
}

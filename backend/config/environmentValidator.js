/**
 * Environment Validation System for Eden Parfum
 * Validates required environment variables and provides type checking, defaults, and documentation
 */

const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
    constructor() {
        this.validationRules = this.defineValidationRules();
        this.validationResults = {
            valid: true,
            errors: [],
            warnings: [],
            missing: [],
            invalid: [],
            suggestions: []
        };
    }

    /**
     * Define validation rules for all environment variables
     */
    defineValidationRules() {
        return {
            // Core Server Configuration
            NODE_ENV: {
                required: true,
                type: 'string',
                allowedValues: ['development', 'production', 'test', 'staging'],
                defaultValue: 'development',
                description: 'Node.js environment mode',
                category: 'server'
            },
            PORT: {
                required: false,
                type: 'number',
                min: 1024,
                max: 65535,
                defaultValue: 3000,
                description: 'Server port number',
                category: 'server'
            },
            FRONTEND_URL: {
                required: true,
                type: 'url',
                defaultValue: 'http://localhost:3000',
                description: 'Frontend application URL for CORS and redirects',
                category: 'server'
            },

            // Database Configuration (Critical)
            // Supabase Configuration (Primary Database)
            SUPABASE_URL: {
                required: true,
                type: 'url',
                pattern: /^https:\/\/.*\.supabase\.co$/,
                description: 'Supabase project URL',
                category: 'database',
                sensitive: false
            },
            SUPABASE_ANON_KEY: {
                required: true,
                type: 'string',
                minLength: 100,
                description: 'Supabase anonymous access key',
                category: 'database',
                sensitive: true
            },
            SUPABASE_SERVICE_ROLE_KEY: {
                required: true,
                type: 'string',
                minLength: 100,
                description: 'Supabase service role key for admin operations',
                category: 'database',
                sensitive: true
            },
            DATABASE_URL: {
                required: false,
                type: 'string',
                pattern: /^postgresql:\/\//,
                description: 'Direct PostgreSQL connection URL',
                category: 'database',
                sensitive: true
            },

            // Logging Configuration
            LOG_LEVEL: {
                required: false,
                type: 'string',
                allowedValues: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
                defaultValue: 'info',
                description: 'Winston logging level',
                category: 'logging'
            },
            LOG_MAX_SIZE: {
                required: false,
                type: 'string',
                pattern: /^\d+[kmgt]?$/i,
                defaultValue: '20m',
                description: 'Maximum log file size (e.g., 20m, 1g)',
                category: 'logging'
            },
            LOG_RETENTION_DAYS: {
                required: false,
                type: 'string',
                pattern: /^\d+d$/,
                defaultValue: '14d',
                description: 'Log file retention period (e.g., 14d)',
                category: 'logging'
            },
            LOG_MAX_SIZE_BYTES: {
                required: false,
                type: 'number',
                min: 1048576, // 1MB
                max: 104857600, // 100MB
                defaultValue: 5242880, // 5MB
                description: 'Maximum log file size in bytes',
                category: 'logging'
            },

            // Monitoring Configuration
            HEALTH_CHECK_INTERVAL: {
                required: false,
                type: 'number',
                min: 10000, // 10 seconds
                max: 300000, // 5 minutes
                defaultValue: 60000, // 1 minute
                description: 'Health check interval in milliseconds',
                category: 'monitoring'
            },
            ENABLE_DETAILED_HEALTH_CHECK: {
                required: false,
                type: 'boolean',
                defaultValue: false,
                description: 'Enable detailed system health checks',
                category: 'monitoring'
            },
            MEMORY_USAGE_ALERT_THRESHOLD: {
                required: false,
                type: 'number',
                min: 50,
                max: 95,
                defaultValue: 80,
                description: 'Memory usage alert threshold percentage',
                category: 'monitoring'
            },
            SLOW_REQUEST_THRESHOLD: {
                required: false,
                type: 'number',
                min: 1000,
                max: 30000,
                defaultValue: 2000,
                description: 'Slow request threshold in milliseconds',
                category: 'monitoring'
            },

            // Error Notification Configuration
            ENABLE_ERROR_EMAIL: {
                required: false,
                type: 'boolean',
                defaultValue: false,
                description: 'Enable email notifications for errors',
                category: 'notifications'
            },
            SMTP_HOST: {
                required: false,
                type: 'string',
                description: 'SMTP server hostname',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_EMAIL'
            },
            SMTP_PORT: {
                required: false,
                type: 'number',
                allowedValues: [25, 465, 587, 2525],
                defaultValue: 587,
                description: 'SMTP server port',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_EMAIL'
            },
            SMTP_USER: {
                required: false,
                type: 'string',
                description: 'SMTP authentication username',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_EMAIL',
                sensitive: true
            },
            SMTP_PASS: {
                required: false,
                type: 'string',
                description: 'SMTP authentication password',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_EMAIL',
                sensitive: true
            },
            ERROR_NOTIFICATION_EMAIL: {
                required: false,
                type: 'email',
                description: 'Email address to receive error notifications',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_EMAIL'
            },

            // Webhook Configuration
            ENABLE_ERROR_WEBHOOKS: {
                required: false,
                type: 'boolean',
                defaultValue: false,
                description: 'Enable webhook notifications for errors',
                category: 'notifications'
            },
            SLACK_WEBHOOK_URL: {
                required: false,
                type: 'url',
                pattern: /^https:\/\/hooks\.slack\.com\/services\//,
                description: 'Slack webhook URL for error notifications',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_WEBHOOKS',
                sensitive: true
            },
            DISCORD_WEBHOOK_URL: {
                required: false,
                type: 'url',
                pattern: /^https:\/\/discord(app)?\.com\/api\/webhooks\//,
                description: 'Discord webhook URL for error notifications',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_WEBHOOKS',
                sensitive: true
            },
            ERROR_WEBHOOK_URL: {
                required: false,
                type: 'url',
                description: 'Custom webhook URL for error notifications',
                category: 'notifications',
                dependsOn: 'ENABLE_ERROR_WEBHOOKS',
                sensitive: true
            },

            // Rate Limiting & Security
            MAX_NOTIFICATIONS_PER_HOUR: {
                required: false,
                type: 'number',
                min: 1,
                max: 100,
                defaultValue: 10,
                description: 'Maximum error notifications per hour',
                category: 'security'
            },
            NOTIFICATION_COOLDOWN: {
                required: false,
                type: 'number',
                min: 60000, // 1 minute
                max: 3600000, // 1 hour
                defaultValue: 300000, // 5 minutes
                description: 'Notification cooldown period in milliseconds',
                category: 'security'
            },
            CRITICAL_ERROR_THRESHOLD: {
                required: false,
                type: 'number',
                min: 1,
                max: 100,
                defaultValue: 5,
                description: 'Number of errors before triggering critical alert',
                category: 'security'
            },
            ERROR_RATE_THRESHOLD: {
                required: false,
                type: 'number',
                min: 0.01,
                max: 1.0,
                defaultValue: 0.1,
                description: 'Error rate threshold (0.1 = 10%)',
                category: 'security'
            },
            RESPONSE_TIME_THRESHOLD: {
                required: false,
                type: 'number',
                min: 1000,
                max: 30000,
                defaultValue: 5000,
                description: 'Response time threshold in milliseconds',
                category: 'security'
            },

            // Application Metadata
            INSTANCE_ID: {
                required: false,
                type: 'string',
                defaultValue: 'default',
                description: 'Application instance identifier',
                category: 'metadata'
            }
        };
    }

    /**
     * Validate all environment variables
     */
    validate() {
        this.validationResults = {
            valid: true,
            errors: [],
            warnings: [],
            missing: [],
            invalid: [],
            suggestions: []
        };

        // Check each validation rule
        Object.entries(this.validationRules).forEach(([key, rule]) => {
            this.validateVariable(key, rule);
        });

        // Check for dependencies
        this.validateDependencies();

        // Check for unknown environment variables
        this.checkUnknownVariables();

        // Generate final report
        this.generateValidationReport();

        return this.validationResults;
    }

    /**
     * Validate a single environment variable
     */
    validateVariable(key, rule) {
        const value = process.env[key];
        const isSet = value !== undefined && value !== '';

        // Check if required variable is missing
        if (rule.required && !isSet) {
            this.validationResults.missing.push({
                key,
                rule,
                message: `Required environment variable ${key} is missing`
            });
            this.validationResults.valid = false;
            return;
        }

        // Skip validation if optional and not set
        if (!isSet && !rule.required) {
            // Set default value if available
            if (rule.defaultValue !== undefined) {
                process.env[key] = rule.defaultValue.toString();
                this.validationResults.suggestions.push({
                    key,
                    message: `Using default value for ${key}: ${rule.defaultValue}`
                });
            }
            return;
        }

        // Validate the value
        const validation = this.validateValue(key, value, rule);
        if (!validation.valid) {
            this.validationResults.invalid.push({
                key,
                rule,
                value: rule.sensitive ? '[REDACTED]' : value,
                message: validation.message
            });
            this.validationResults.valid = false;
        }
    }

    /**
     * Validate a single value against its rule
     */
    validateValue(key, value, rule) {
        try {
            switch (rule.type) {
                case 'string':
                    return this.validateString(value, rule);
                case 'number':
                    return this.validateNumber(value, rule);
                case 'boolean':
                    return this.validateBoolean(value, rule);
                case 'url':
                    return this.validateUrl(value, rule);
                case 'email':
                    return this.validateEmail(value, rule);
                default:
                    return { valid: true };
            }
        } catch (error) {
            return {
                valid: false,
                message: `Validation error for ${key}: ${error.message}`
            };
        }
    }

    /**
     * Validate string values
     */
    validateString(value, rule) {
        if (typeof value !== 'string') {
            return { valid: false, message: 'Must be a string' };
        }

        if (rule.minLength && value.length < rule.minLength) {
            return { valid: false, message: `Must be at least ${rule.minLength} characters long` };
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            return { valid: false, message: `Must be no more than ${rule.maxLength} characters long` };
        }

        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
            return { valid: false, message: `Must be one of: ${rule.allowedValues.join(', ')}` };
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            return { valid: false, message: 'Does not match required format' };
        }

        return { valid: true };
    }

    /**
     * Validate number values
     */
    validateNumber(value, rule) {
        const num = Number(value);
        
        if (isNaN(num)) {
            return { valid: false, message: 'Must be a valid number' };
        }

        if (rule.min !== undefined && num < rule.min) {
            return { valid: false, message: `Must be at least ${rule.min}` };
        }

        if (rule.max !== undefined && num > rule.max) {
            return { valid: false, message: `Must be no more than ${rule.max}` };
        }

        if (rule.allowedValues && !rule.allowedValues.includes(num)) {
            return { valid: false, message: `Must be one of: ${rule.allowedValues.join(', ')}` };
        }

        return { valid: true };
    }

    /**
     * Validate boolean values
     */
    validateBoolean(value, rule) {
        const booleanValues = ['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'];
        
        if (!booleanValues.includes(value.toLowerCase())) {
            return { valid: false, message: 'Must be a boolean value (true/false, 1/0, yes/no, on/off)' };
        }

        return { valid: true };
    }

    /**
     * Validate URL values
     */
    validateUrl(value, rule) {
        try {
            const url = new URL(value);
            
            if (rule.pattern && !rule.pattern.test(value)) {
                return { valid: false, message: 'URL does not match required format' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, message: 'Must be a valid URL' };
        }
    }

    /**
     * Validate email values
     */
    validateEmail(value, rule) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailPattern.test(value)) {
            return { valid: false, message: 'Must be a valid email address' };
        }

        return { valid: true };
    }

    /**
     * Validate dependencies between environment variables
     */
    validateDependencies() {
        Object.entries(this.validationRules).forEach(([key, rule]) => {
            if (rule.dependsOn) {
                const dependentValue = process.env[rule.dependsOn];
                const currentValue = process.env[key];
                
                // Check if dependency is enabled but current variable is missing
                if (this.isTruthy(dependentValue) && !currentValue) {
                    this.validationResults.warnings.push({
                        key,
                        message: `${key} should be set when ${rule.dependsOn} is enabled`
                    });
                }
            }
        });
    }

    /**
     * Check for unknown environment variables that might be typos
     */
    checkUnknownVariables() {
        const knownKeys = Object.keys(this.validationRules);
        const envKeys = Object.keys(process.env).filter(key => 
            key.startsWith('EDEN_') || 
            key.startsWith('SUPABASE_') ||
            key.startsWith('SMTP_') ||
            key.startsWith('LOG_') ||
            key.startsWith('ERROR_') ||
            key.startsWith('SLACK_') ||
            key.startsWith('DISCORD_') ||
            ['NODE_ENV', 'PORT', 'FRONTEND_URL'].includes(key)
        );

        envKeys.forEach(key => {
            if (!knownKeys.includes(key)) {
                this.validationResults.warnings.push({
                    key,
                    message: `Unknown environment variable: ${key} - might be a typo?`
                });
            }
        });
    }

    /**
     * Check if a value is truthy (for boolean dependencies)
     */
    isTruthy(value) {
        if (!value) return false;
        const truthyValues = ['true', '1', 'yes', 'on'];
        return truthyValues.includes(value.toLowerCase());
    }

    /**
     * Generate validation report
     */
    generateValidationReport() {
        // Silent validation - no console output
    }

    /**
     * Generate category-wise summary
     */
    generateCategorySummary() {
        // Silent validation - no console output
    }

    /**
     * Generate .env.example file
     */
    generateEnvExample() {
        let content = '# Eden Parfum Environment Configuration\n';
        content += '# Copy this file to .env and configure your values\n\n';

        const categories = {};
        
        // Group by category
        Object.entries(this.validationRules).forEach(([key, rule]) => {
            if (!categories[rule.category]) {
                categories[rule.category] = [];
            }
            categories[rule.category].push({ key, rule });
        });

        // Generate content by category
        Object.entries(categories).forEach(([category, variables]) => {
            content += `# ${category.toUpperCase()} CONFIGURATION\n`;
            content += `# ${'-'.repeat(50)}\n\n`;

            variables.forEach(({ key, rule }) => {
                content += `# ${rule.description}\n`;
                
                if (rule.allowedValues) {
                    content += `# Allowed values: ${rule.allowedValues.join(', ')}\n`;
                }
                
                if (rule.pattern) {
                    content += `# Format: ${rule.pattern.toString()}\n`;
                }
                
                if (rule.min !== undefined || rule.max !== undefined) {
                    content += `# Range: ${rule.min || 'any'} - ${rule.max || 'any'}\n`;
                }

                const exampleValue = rule.sensitive ? 'your_secret_value_here' : 
                                   rule.defaultValue || 'your_value_here';
                
                if (rule.required) {
                    content += `${key}=${exampleValue}\n\n`;
                } else {
                    content += `# ${key}=${exampleValue}\n\n`;
                }
            });
        });

        return content;
    }

    /**
     * Get environment summary for health checks
     */
    getEnvironmentSummary() {
        const summary = {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3000,
            databaseConfigured: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY),
            loggingConfigured: !!process.env.LOG_LEVEL,
            monitoringConfigured: !!process.env.HEALTH_CHECK_INTERVAL,
            notificationsConfigured: !!(process.env.ENABLE_ERROR_EMAIL || process.env.ENABLE_ERROR_WEBHOOKS),
            validationPassed: this.validationResults.valid,
            lastValidated: new Date().toISOString()
        };

        return summary;
    }
}

module.exports = EnvironmentValidator;
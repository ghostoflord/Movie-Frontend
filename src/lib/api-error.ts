export type ApiErrorContext = {
    fallback?: string;
};

function looksTechnical(msg: string): boolean {
    const m = msg.toLowerCase();
    return (
        m.includes('sqlstate') ||
        m.includes('syntax error') ||
        m.includes('stack trace') ||
        m.includes('laravel') ||
        m.includes('vendor/') ||
        m.includes('exception') ||
        m.includes('failed to connect') ||
        m.includes('connection refused') ||
        m.includes('actively refused') ||
        m.includes('ecconnrefused') ||
        m.includes('at ') ||
        m.includes('select ') ||
        m.includes('insert ') ||
        m.includes('update ') ||
        m.includes('delete ')
    );
}

export function toUserErrorMessage(input: unknown, ctx: ApiErrorContext = {}): string {
    const fallback = ctx.fallback || 'Hệ thống đang bận. Vui lòng thử lại sau.';

    if (typeof input === 'string') {
        const msg = input.trim();
        if (!msg) return fallback;
        return looksTechnical(msg) ? fallback : msg;
    }

    if (input && typeof input === 'object') {
        const o = input as Record<string, unknown>;
        const msg = typeof o.message === 'string' ? o.message.trim() : '';
        if (msg) return looksTechnical(msg) ? fallback : msg;
        const err = typeof o.error === 'string' ? o.error.trim() : '';
        if (err) return looksTechnical(err) ? fallback : err;
    }

    return fallback;
}


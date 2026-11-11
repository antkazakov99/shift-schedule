export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly errors: Record<string, string[]> = {},
    ) {
        super(message);
    }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function request<T>(method: Method, url: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`/api${url}`, {
            method,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError('Нет соединения с сервером', 0);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const json: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const payload = (json ?? {}) as { message?: string; errors?: Record<string, string[]> };
        throw new ApiError(payload.message ?? `Ошибка сервера (${response.status})`, response.status, payload.errors ?? {});
    }

    return json as T;
}

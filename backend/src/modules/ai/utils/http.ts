export async function postJSON<T>(
    url: string,
    body: unknown,
    headers: Record<string, string>,
): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
}
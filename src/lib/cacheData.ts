// functions to fetch and set data in cookies, to reduce api calls

export function cacheData(
    cookieName: string,
    fetchFunction: () => Promise<any>,
    maxAgeSeconds: number
) {
    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${cookieName}=`));

    if (cookie) {
        try {
            return JSON.parse(cookie.split("=")[1]);
        } catch (err) {
            console.error("Failed to parse cookie:", err);
            document.cookie = `${cookieName}=; path=/; max-age=0`;
        }
    }

    return fetchFunction().then((data) => {
        document.cookie = `${cookieName}=${JSON.stringify(data)}; path=/; max-age=${maxAgeSeconds}`;
        return data;
    });
}


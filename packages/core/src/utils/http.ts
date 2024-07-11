export const makeHttpRequest = async function <T>(
  url: string,
  options: {
    [x: string]: unknown;
  } = {
    cache: "no-cache",
  }
): Promise<T | null> {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(response.statusText);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw err;
    } else {
      console.error(`Error fetching ${url}: `, err);
    }
    return null;
  }
};

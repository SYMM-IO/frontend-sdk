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

export const makeHttpRequestV2 = async function <T>(
  url: string,
  options: {
    [x: string]: any;
  } = {
    cache: "no-cache",
  }
): Promise<{ result: T | null; status: number }> {
  try {
    const response = await fetch(url, options);
    return { result: await response.json(), status: response.status };
  } catch (err) {
    console.error(`Error fetching ${url}: `, err);
    return { result: null, status: 500 };
  }
};

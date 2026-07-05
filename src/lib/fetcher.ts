export const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    // This will tell us exactly which URL failed and what the HTTP status was!
    console.error(`Fetch failed for ${url} with status: ${res.status}`);
    throw new Error(`Failed to fetch ${url} (Status: ${res.status})`);
  }
  
  return res.json();
};
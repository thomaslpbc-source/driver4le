
function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function rankDrivers(drivers, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  const results = drivers
    .map((driver) => {
      const normalizedName = normalize(driver.name);
      const parts = normalizedName.split(/\s+/);
      const fullStarts = normalizedName.startsWith(normalizedQuery);
      const partStarts = parts.some((part) => part.startsWith(normalizedQuery));
      const contains = normalizedName.includes(normalizedQuery);

      let score = -1;
      if (fullStarts) score = 0;
      else if (partStarts) score = 1;
      else if (contains) score = 2;

      return { driver, score };
    })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => a.score - b.score || a.driver.name.localeCompare(b.driver.name, 'fr'))
    .slice(0, 7)
    .map((entry) => entry.driver);

  return results;
}

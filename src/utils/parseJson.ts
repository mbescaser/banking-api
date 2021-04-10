const parseJson = <T>(json: string): T => {
  try {
    return JSON.parse(json);
  } catch {
    throw new Error('Failed to parse json string.');
  }
};

export default parseJson;

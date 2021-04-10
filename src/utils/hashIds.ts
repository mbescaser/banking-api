import Hashids from 'hashids';

const hashIds = new Hashids(process.env.HASHIDS_SALT, 10);

const encodeItems = <T>(items: T, keys: string[]): T =>
  Object.entries(items).reduce((prev, [key, value]) => {
    if (!keys.includes(key)) {
      return {
        ...prev,
        [key]: value,
      };
    }

    const encoded = hashIds.encode(value);

    return {
      ...prev,
      [key]: encoded,
    };
  }, {} as T);
const decodeItems = <T>(items: T): Record<string, number> =>
  Object.entries(items).reduce((prev, [key, value]) => {
    const decoded = hashIds.decode(value).pop();

    if (decoded === undefined) {
      throw new Error('Failed to decode hashed value.');
    }

    return {
      ...prev,
      [key]: decoded,
    };
  }, {});

export { decodeItems, encodeItems };
export default hashIds;

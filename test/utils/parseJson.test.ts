import parseJson from '@utils/parseJson';

it('should return parsed json', () => {
  expect(parseJson('{}')).toEqual({});
});

it('should throw error for parsing json', () => {
  try {
    parseJson('undefined');
  } catch (error) {
    expect(error).toEqual(new Error('Failed to parse json string.'));
  }
});

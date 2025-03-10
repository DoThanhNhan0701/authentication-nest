const generateKey = (len: number) => {
  const data = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWYZ';
  let key = '';
  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * data.length);
    key += data.charAt(position);
  }
  return key;
};

export default generateKey;

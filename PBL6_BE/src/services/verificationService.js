const verificationStore = new Map();

export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveCode = (email, code) => {
  verificationStore.set(email, {
    code,
    expireAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
};

export const verifyEmailCode = (email, code) => {
  const record = verificationStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expireAt) return false;
  if (record.code !== code) return false;
  return true;
};

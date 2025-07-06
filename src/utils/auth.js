export const setToken = (token, userID, accountID, rememberMe = false) => {
  const options = rememberMe
    ? { expires: 30, secure: process.env.NODE_ENV === 'production' }
    : { expires: 1, secure: process.env.NODE_ENV === 'production' };

  Cookies.set('authToken', token, options);
  Cookies.set('userID', userID, options);
  Cookies.set('accountID', accountID, options);
};

export const getToken = () => Cookies.get('authToken');
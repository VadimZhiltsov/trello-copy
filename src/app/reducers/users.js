// users object is set server side and is never updated client side but this empty reducer is still needed
const users = (state = null, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default users;


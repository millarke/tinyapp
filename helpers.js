
// checks to see if email exists
const checkIfEmailExists = function(emailToCheck, usersObj) {
  for (let UID in usersObj) {
    if (emailToCheck === usersObj[UID]['email']) {
      return true;
    }
  }
  return false;
};

// generates an alphanumeric string 6 characters long
const generateRandomString = function() {
  const alphaNumericString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let UID = '';
  for (let i = 0; i < 6; i++) {
    UID = UID + alphaNumericString[Math.floor(Math.random() * (61 - 0) + 0)];
  }
  return UID;
};

// finds object key by value
const getUserByEmail = function(object, valueLookingFor) {
  for (const key in object) {
    if (object[key].email === valueLookingFor) {
      return object[key];
    }
  }
  return false;
};

module.exports = { checkIfEmailExists, generateRandomString, getUserByEmail };
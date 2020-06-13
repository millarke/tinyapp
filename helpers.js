
// checks to see if email exists
const checkIfEmailExists = function(emailToCheck, usersObj) {
  for (let UID in usersObj) {
    console.log("usersObj: ", usersObj);
    console.log("usersObj[UID]: ", usersObj[UID]);
    console.log("usersObj[UID]['email']: ", usersObj[UID]['email']);
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
// TODO: accidentally hardcoded email into this
const getUserByEmail = function(object, valueLookingFor) {
  for (const key in object) {
    if (object[key].email === valueLookingFor) {
      // console.log("object.key: ", object[key]);
      return object[key];
      // maybe users = object key and then return users?
    }
  }
  return false;
};

module.exports = { checkIfEmailExists, generateRandomString, getUserByEmail };
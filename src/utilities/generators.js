//generate otp
const generateOtp = async () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  //account id
  const generateAccountId = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
      return `KV${randomNum}`; // Example: KV738291
  };
  
  //temporary password
  const generateTempPassword = () => {
      const characters = "abcdefghijklmnopqrstuvwxyz"; // Only small letters
      let tempPassword = "";
  
      for (let i = 0; i < 10; i++) {
          tempPassword += characters.charAt(Math.floor(Math.random() * characters.length));
      }
  
      return tempPassword;
  }
  
  
  module.exports = {
      generateAccountId,
      generateOtp,
      generateTempPassword
  } 
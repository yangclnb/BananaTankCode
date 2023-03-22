import axios from "axios";
const host = "https://tankcodeapi.yancdrag.top:3086/api";

async function reportGrade(options) {
  const result = await axios.post(`${host}/reportGrade`, options);
  return result.data;
}

// userID, userName, hitCount, survivalTime, pubtime
async function getAllGrade() {
  const result = await axios.get(`${host}/getAllGrade`);
  return result.data.data;
}

async function getCode(userID) {
  const result = await axios.get(`${host}/getCode/${userID}`);
  return result.data.data[0];
}

async function reportError(data) {
  const result = await axios.post(`${host}/reportError`, data);
  return result.data.data;
}

export { reportGrade, getAllGrade, getCode, reportError };

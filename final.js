import http from 'k6/http'; 
import { check, sleep } from 'k6'; 
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"; 
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js"; 

// Fungsi Reporting
export function handleSummary(data) {
  const reportName = "Report";
  const title = "Reqres.in API Report";
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(2, 12); 
  return {
    [`${reportName}_${timestamp}.html`]: htmlReport(data, { title: title }),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}


// Definisi opsi pengujian
export const options = {
  vus: 1000, // Jumlah virtual users (VUs)
  iterations: 3500, // Jumlah iterasi
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Ambang batas untuk durasi HTTP request
  },
};

// Base URL API yang akan diuji
const BASE_URL = 'https://reqres.in/api/';

// URL untuk endpoint POST dan PUT
const POST_URL = `${BASE_URL}users`;
const PUT_URL = `${BASE_URL}users/2`;

// Header request yang diperlukan
const REQUEST_PARAMS = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Payload (data) untuk request POST dan PUT dalam format JSON
const postPayload = JSON.stringify({ name: 'morpheus', job: 'leader' });
const putPayload = JSON.stringify({ name: 'morpheus', job: 'zion resident' });

// Function yang akan dieksekusi oleh k6
export default function () {
  // Melakukan request POST dan PUT
  const postResponse = http.post(POST_URL, postPayload, REQUEST_PARAMS);
  const putResponse = http.put(PUT_URL, putPayload, REQUEST_PARAMS);

   // Assertions for POST request
  check(postResponse, {
    'POST request status is 201': (r) => r.status === 201,
    'POST request body is correct': (r) => r.json().name === 'morpheus' && r.json().job === 'leader',
  });

  // Assertions for PUT request
  check(putResponse, {
    'PUT request status is 200': (r) => r.status === 200,
    'PUT request body is correct': (r) => r.json().name === 'morpheus' && r.json().job === 'zion resident',
  });

  // Menunggu 1 detik sebelum melanjutkan ke iterasi berikutnya
  sleep(1);
}

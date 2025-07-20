// callApi.js
import fetch from 'node-fetch'  // omit this line if Node 18+ with built-in fetch

async function callSaveComponentAPI() {
    try {
        const code = `
import React from 'react';

function HelloWorld() {
  return <h1>Hello World</h1>;
}

export default HelloWorld;
`
        const response = await fetch('http://localhost:3000/api/component', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 'helloWorld',
                code
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
    } catch (error) {
        console.error('Error calling API:', error);
    }
}

callSaveComponentAPI();

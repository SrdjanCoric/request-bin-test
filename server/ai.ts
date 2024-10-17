/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
require('dotenv').config();

async function fetchOpenAIOutput(prompt: string): Promise<any> {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const method = 'POST';
  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_KEY}`,
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({
    messages: [
      {
        role: 'system',
        content:
          'Do a shitty pirate commentary for the following HTTP info. Small paragraph shall do. Output in HTML with bold tags and a bunch of emojis',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 500,
    model: 'gpt-4o',
  });

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body,
    });

    // if (!response.ok) {
    // throw new Error(`HTTP error, response status is ${response.status}`);
    // }

    const data = await response.json();
    console.log(data);
    return data.choices[0].message.content;
  } catch (error) {
    console.log(error);
  }
}

export default fetchOpenAIOutput;

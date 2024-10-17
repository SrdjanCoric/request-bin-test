const BASE_URL = 'ec2-54-81-13-211.compute-1.amazonaws.com:3001';

document.addEventListener('DOMContentLoaded', () => {
  const newBtn = document.querySelector('.new');

  newBtn.addEventListener('click', async () => {
    console.log('new btn pressed');
    try {
      const res = await fetch(`${BASE_URL}/api/create_new_bin`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const id = await res.json();
      console.log('New bin ID:', id);

      const newUrl = `${BASE_URL}/bin/${id}/webhook`;

      // Update the displayed endpoint without changing the browser's URL
      document.querySelector('.endpoint').textContent = 'Endpoint: ' + newUrl;

      // Store the current bin ID in localStorage
      localStorage.setItem('currentBinId', id);

      // Populate the requests for the new bin
      await populateRequests();
    } catch (error) {
      console.error('Error creating new bin:', error);
      document.querySelector('.endpoint').textContent =
        'Error creating new bin. Please try again.';
    }
  });

  document
    .querySelector('.endpoint-buttons button')
    .addEventListener('click', () => {
      const endpointText = document
        .querySelector('.endpoint')
        .textContent.replace('Endpoint: ', '');
      navigator.clipboard
        .writeText(endpointText)
        .then(() => console.log('Endpoint copied to clipboard!'))
        .catch((err) => console.error('Failed to copy: ', err));
    });

  const initialBinId = extractBinId();
  if (initialBinId) {
    document.querySelector(
      '.endpoint'
    ).textContent = `Endpoint: ${BASE_URL}/bin/${initialBinId}`;
  } else {
    document.querySelector('.endpoint').textContent =
      "Endpoint: Click 'New' to create endpoint";
  }

  // add event listener for each request created
  document.querySelector('.request-log').addEventListener('click', (event) => {
    console.log(event.target);
    if (event.target.matches('.request-btn, .request-btn *')) {
      const btn = event.target.closest('button');
      document.querySelector('.pirate-talk').innerHTML = '';

      document.querySelector('.request-details-grid').innerHTML = '';
      populateRequestDetails(btn);
    }
  });

  async function populateRequestDetails(btn) {
    const binId = extractBinId();
    const requestId = btn.id;
    const requestIdURL = `${BASE_URL}/api/${binId}/requests/${requestId}`;
    const response = await fetch(requestIdURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    const data = await response.json();
    console.log('lalala', data);

    const { method, url, headers, query, body } = data;
    const gridElement = document.querySelector('.request-details-grid');
    // 1 - header e.g. request_id and timestamp (always)
    // document.querySelector('.request-details-id').textContent = requestId;
    // const { time, date } = formatTimeAndDate(btn.dataset.time);
    // document.querySelector('.request-details-created_at').textContent =
    //   `${time} ${date}`;
    // 2 - Details e.g. Method and Path (always)
    const methodPathTitle = document.createElement('h5');
    methodPathTitle.textContent = 'Details';
    gridElement.append(methodPathTitle);
    const methodPathElement = createMethodPathDetails(method, url);
    gridElement.append(methodPathElement);
    // 3 - Headers (always? still add dynamically)
    if (headers !== '{}') {
      const headersTitle = document.createElement('h5');
      headersTitle.textContent = 'Headers';
      gridElement.append(headersTitle);
      const headersElement = createHeaders(headers);
      gridElement.append(headersElement);
    }
    // 4 - Query (sometimes, e.g. GET)
    if (query !== '{}') {
      console.log(data.query);
      const queryTitle = document.createElement('h5');
      queryTitle.textContent = 'Query';
      gridElement.append(queryTitle);
      const queryElement = createQueries(query);
      gridElement.append(queryElement);
    }
    // 5 - Body (sometimes, e.g. POST)
    if (body !== '{}') {
      const bodyTitle = document.createElement('h5');
      bodyTitle.textContent = 'Body';
      gridElement.append(bodyTitle);
      const bodyElement = document.createElement('code');
      bodyElement.classList.add('request-details-body');
      bodyElement.textContent = JSON.stringify(JSON.parse(body), null, 4);
      gridElement.append(bodyElement);
    }
  }

  function createMethodPathDetails(method, path) {
    const containerEl = document.createElement('div');
    containerEl.classList.add('request-details-details');
    containerEl.innerHTML = `

    <span style="color: ${getMethodColor(
      method
    )}; font-weight: bold;">${method}</span>
    <span>
      ${path}
    </span>
    `;
    return containerEl;
  }

  function createHeaders(headers) {
    const headersElement = document.createElement('div');
    headersElement.classList.add('request-details-headers');

    Object.entries(JSON.parse(headers)).forEach(([headerKey, headerValue]) => {
      const headerDiv = document.createElement('div');
      headerDiv.classList.add('request-details-headers-header');
      const headerKeyElement = document.createElement('span');
      headerKeyElement.classList.add('request-details-header-key');
      headerKeyElement.textContent = headerKey;
      const headerValElement = document.createElement('span');
      headerValElement.classList.add('request-details-header-value');
      headerValElement.textContent = headerValue;
      headerDiv.append(headerKeyElement);
      headerDiv.append(headerValElement);
      headersElement.append(headerDiv);
    });
    return headersElement;
  }

  function createQueries(queries) {
    const queryElement = document.createElement('div');
    queryElement.classList.add('request-details-queries');

    Object.entries(JSON.parse(queries)).forEach(([queryKey, queryValue]) => {
      const queryDiv = document.createElement('div');
      queryDiv.classList.add('request-details-query');
      const queryKeyElement = document.createElement('span');
      queryKeyElement.classList.add('request-details-query-key');
      queryKeyElement.textContent = queryKey;
      const queryValElement = document.createElement('span');
      queryValElement.classList.add('request-details-query-value');
      queryValElement.textContent = queryValue;
      queryDiv.append(queryKeyElement);
      queryDiv.append(queryValElement);
      queryElement.append(queryDiv);
    });
    return queryElement;
  }

  function groupRequestsByDate(requests) {
    const requestsByDate = {};
    requests.forEach(({ time, method, path, id }) => {
      const dayKey = formatTimeAndDate(time).date;
      console.log('Day Key = ', dayKey);
      requestsByDate[dayKey] ||= [];
      requestsByDate[dayKey].unshift({ time, method, path, id });
    });

    return requestsByDate;
  }

  // container
  // header - date - appended to container
  // requests - unorderd list of buttons - appended to container
  // containerList = array of div containers
  function displayDailyRequests(requestsObj) {
    let containerList = [];
    Object.entries(requestsObj).forEach(([date, requestsArr]) => {
      let container = document.createElement('div');
      const header = document.createElement('h2');
      header.textContent = date;
      container.append(header);

      const unorderList = createRequestButtons(requestsArr);

      container.append(unorderList);
      containerList.push(container);
    });

    console.log(containerList);
    return containerList.toReversed();
  }

  function formatTimeAndDate(timeDateString) {
    const dateOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // This ensures the time is in 12-hour format with AM/PM
    };

    const formattedTime = new Date(timeDateString).toLocaleString(
      'en-US',
      timeOptions
    );
    const formattedDate = new Date(timeDateString).toLocaleString(
      'en-US',
      dateOptions
    );
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };
    const localTimeString = timeDateString.toLocaleString('en-US', options);
    return { time: formattedTime, date: formattedDate };
  }

  function getMethodColor(method) {
    let methodColor;
    switch (method) {
      case 'GET':
        methodColor = 'green';
        break;
      case 'DELETE':
        methodColor = 'red';
        break;
      default:
        methodColor = 'blue';
    }
    return methodColor;
  }

  function createRequestButtons(requestArray) {
    const ul = document.createElement('ul');

    requestArray.forEach(({ time, method, path, id }) => {
      const li = document.createElement('li');
      li.classList.add('request-item');

      li.innerHTML = `
          <button class='request-btn' data-time='${time}'></button>
      `;

      const formattedTime = formatTimeAndDate(time).time;

      const btn = li.querySelector('.request-btn');
      btn.innerHTML = `<span>${formattedTime} | </span>
      <span style="color: ${getMethodColor(
        method
      )}; font-weight: bold;">${method}</span>
      <span> | ${path}</span>
      `;
      btn.id = id;
      ul.append(li);
    });

    return ul;
  }

  async function sendComplexRequests(url, numRequests) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const headers = [
      {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
        'Large-Header': 'aaa '.repeat(10),
      },
      {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Custom-Header': 'CustomValue',
        'Another-Header': 'bbb '.repeat(10),
      },
      {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Additional-Header': 'ccc '.repeat(10),
      },
      {
        Authorization: 'Basic dXNlcjpwYXNz',
        'Yet-Another-Header': 'ddd '.repeat(10),
      },
    ];
    const payloads = [
      JSON.stringify({
        key1: 'value1',
        key2: 'value2',
        largeField: 'e '.repeat(1000),
      }),
      JSON.stringify({
        keyA: 'valueA',
        keyB: 'valueB',
        anotherLargeField: 'f '.repeat(1000),
      }),
      new URLSearchParams({
        param1: 'value1',
        param2: 'value2',
        longParam: 'g '.repeat(1000),
      }).toString(),
      'simple string payload',
      JSON.stringify({
        nested: {
          key: 'nestedValue',
          deepField: 'h '.repeat(1000),
        },
      }),
    ];

    for (let i = 0; i < numRequests; i++) {
      const method = methods[Math.floor(Math.random() * methods.length)];
      const header = headers[Math.floor(Math.random() * headers.length)];
      const payload = payloads[Math.floor(Math.random() * payloads.length)];

      const options = {
        method: method,
        headers: header,
      };

      if (method !== 'GET' && method !== 'DELETE') {
        if (header['Content-Type'] === 'application/x-www-form-urlencoded') {
          options.body = new URLSearchParams(payload).toString();
        } else {
          options.body = payload;
        }
      }

      const requestUrl = `${url}`;

      try {
        const response = await fetch(requestUrl, options);
        const data = await response.json();
        console.log(`Response for request ${i + 1}:`, data);
      } catch (error) {
        console.error(`Error for request ${i + 1}:`, error);
      }
    }
  }

  const btn = document.createElement('button');
  btn.classList.add('test-request');
  btn.textContent = 'SEND TEST REQUESTS';
  document.body.append(btn);

  document
    .querySelector('.test-request')
    .addEventListener('click', async () => {
      console.log(window.location.href.replace('/public', ''));
      console.log('test');
      await sendComplexRequests(window.location.href.replace('/public', ''), 5);
      await populateRequests();
    });

  document.querySelector('.pirate').addEventListener('click', async () => {
    try {
      const prompt = document.querySelector('.request-details').textContent;
      const p = document.querySelector('.pirate-talk');
      p.textContent =
        'Ahoy matey! 🏴‍☠️ Hold yer horses and wait fer a response from the pirate! 🏴‍☠️🦜⚓';

      const response = await fetch(`${BASE_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ prompt: prompt.slice(0, 1000) }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const res = await response.json();
      console.log(res);

      // Use innerHTML to render the HTML content
      p.innerHTML = res.text;

      // Optional: If you want to sanitize the HTML to prevent XSS attacks
      // p.textContent = '';
      // p.appendChild(document.createRange().createContextualFragment(res.text));
    } catch (error) {
      console.error('Error:', error);
      document.querySelector('.pirate-talk').textContent =
        'Arrr! There be an error, matey! 🏴‍☠️';
    }
  });
  function extractBinId() {
    // First, try to get the bin ID from localStorage
    const storedBinId = localStorage.getItem('currentBinId');
    if (storedBinId) {
      return storedBinId;
    }

    // If not in localStorage, try to extract from the URL (for compatibility with direct URL access)
    const path = window.location.pathname;
    const pathParts = path.split('/').filter((part) => part !== '');

    if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === 'bin') {
      return pathParts[pathParts.length - 1];
    }

    // If we can't find a bin ID, return null
    return null;
  }

  async function populateRequests() {
    document.querySelector(
      '.request-log'
    ).innerHTML = `<h2 class='log-title'>Request Log</h2>`;
    const binId = extractBinId();
    if (!binId) {
      console.log('Not on a bin page');
      return;
    }
    console.log('Bin ID:', binId);
    console.log('right before request');
    try {
      const url = `${BASE_URL}/api/${binId}`;
      console.log('Fetching from URL:', url);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers));
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const textResponse = await res.text();
      console.log('Raw response:', textResponse);
      const requests = JSON.parse(textResponse);
      console.log('Parsed requests:', requests);
      document.querySelector('.request-details-grid').innerHTML = '';
      const requestsGrouped = groupRequestsByDate(requests);
      console.log(requestsGrouped);
      const dayContainerArr = displayDailyRequests(requestsGrouped);
      document.querySelector('.request-log').append(...dayContainerArr);
    } catch (error) {
      console.error('Error populating requests:', error);
      document.querySelector('.request-log').innerHTML +=
        '<p>Error loading requests. Please try again.</p>';
    }
  }

  populateRequests();
});

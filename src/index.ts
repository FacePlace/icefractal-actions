import axios from 'axios';
import * as core from '@actions/core';

(async function() {
  const pages = core.getInput('pages');
  console.log(pages);
  const apiKey = core.getInput('apiKey');

  await axios.post(
    'https://api.omnifractal.com/v1/auditWithActions',
    {
      pages: [
        pages,
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );
})();

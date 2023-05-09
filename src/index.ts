import axios from 'axios';
import fs from 'fs';
import * as core from '@actions/core';

async function checkAuditStatus(auditTrackingIDs: string[]) {
  const res = await axios
    .post(
      'https://api.omnifractal.com/v1/checkAuditStatus', {
        audits: auditTrackingIDs,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

  return res.data;
}

const formatSpaces = (str: string) => {
  return str.split('\n').map((line) => '  ' + line).join('\n');
};

type AuditStatus = 'scheduled' | 'running' | 'completed' | 'failed' | 'error'
type Audit = {
  status: AuditStatus;
  message?: string;
  page_name?: string;
  profile_name?: string;
}

(async function() {
  try {
    const pages = core.getInput('pages').split(/[\n\s]+/).map((page) => page.trim());

    const budgetsPath = core.getInput('budgetsPath');
    const budgets = budgetsPath ?
      JSON.parse(fs.readFileSync(budgetsPath, 'utf8')) :
      undefined;

    const apiKey = core.getInput('apiKey');

    // Retrieve additional information
    const branch = core.getInput('branch');
    const repository = core.getInput('repository');
    const waitForResults = core.getInput('waitForResults') ? core.getInput('waitForResults') === 'true' : true;
    const timeout = core.getInput('timeout') ? parseInt(core.getInput('timeout'), 10) : 300;

    if (timeout < 60) {
      core.setFailed('Error: timeout must be at least 60 seconds');
      return;
    } else if (timeout > 600) {
      core.setFailed('Error: timeout must be at most 600 seconds (10 minutes)');
      return;
    }

    const commitSha = core.getInput('commit_sha');
    const commitMessage = core.getInput('commit_message');
    const commitAuthor = core.getInput('commit_author');
    const commitAuthorEmail = core.getInput('commit_author_email');

    let auditTrackingIDs: string[] = [];

    await axios
      .post(
        'https://api.omnifractal.com/v1/auditWithActions', {
          pages: pages,
          budgets: budgets,
          branch: branch,
          repository: repository,
          commit_sha: commitSha,
          commit_message: commitMessage,
          commit_author: commitAuthor,
          commit_author_email: commitAuthorEmail,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      )
      .then(async (res) => {
        if (res.status >= 400) {
          core.setFailed(`Error: ${res.status} - ${res.data.message || res.statusText || 'Something went wrong'}`);
        } else {
          if (res.data && res.data.audits && Array.isArray(res.data.audits)) {
            auditTrackingIDs = res.data.audits;
          }

          const startTime = new Date().getTime();
          const endTime = startTime + ((timeout) * 1000);

          while (waitForResults) {
            const finishedAudits: Audit[] = [];

            if (new Date().getTime() >= endTime) {
              let message = `Error: ${finishedAudits.length} out of ${auditTrackingIDs.length} audits took too long to complete.\n`;

              if (finishedAudits.length > 0) {
                message += 'The following audits have finished:\n';
                finishedAudits.forEach((audit) => {
                  message += `- Page: ${audit.page_name}.\n  Profile: ${audit.profile_name}.\n  Status: ${audit.status}.\n`;
                  if (audit.message) {
                    message += `${formatSpaces(audit.message)}\n`;
                  }
                });
              }

              core.setFailed(message);
              break;
            }

            const auditStatus = await checkAuditStatus(auditTrackingIDs);

            if (auditStatus.audits && auditStatus.audits.length > 0) {
              auditStatus.audits.forEach((audit: Audit) => {
                if (audit.status === 'completed' || audit.status === 'failed' || audit.status === 'error') {
                  finishedAudits.push(audit);
                }
              });

              if (finishedAudits.length >= auditTrackingIDs.length) {
                let message = `${finishedAudits.length} out of ${auditTrackingIDs.length} audits have finished.\n`;

                if (finishedAudits.length > 0) {
                  message += 'The following audits have finished:\n';
                  finishedAudits.forEach((audit) => {
                    message += `- Page: ${audit.page_name}.\n  Profile: ${audit.profile_name}.\n  Status: ${audit.status}.\n`;
                    if (audit.message) {
                      message += `${formatSpaces(audit.message)}\n`;
                    }
                  });
                }

                if (finishedAudits.filter((audit) => audit.status === 'failed' || audit.status === 'error').length > 0) {
                  core.setFailed(message);
                }
                core.debug(message);
                break;
              }
            } else {
              core.setFailed('Error: No response received from the server');
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 10000));
          }
        }
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          core.setFailed(`Error: ${error.response.status} - ${error.response.data.message || error.response.message || error.response.statusText || 'Something went wrong'}`);
          console.error('Error details:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          core.setFailed('Error: No response received from the server');
          console.error('Error details:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          core.setFailed(`Error: ${error.message || error.data.message || 'Something went wrong'}`);
          console.error('Error details:', error);
        }
      });
  } catch (error: any) {
    core.setFailed(`Error: ${error.message}`);
    console.error('Error details:', error);
  }
})();

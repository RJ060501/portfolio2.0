export const sampleEvents = [
  {
    id: 'EVT-001',
    user: 'alex@example.test',
    type: 'Unfamiliar sign-in',
    severity: 'High',
    time: '09:42',
    detail:
      'A sign-in from a new location follows repeated failed attempts. This combination deserves review, but does not by itself prove compromise.',
    steps: [
      'Review the sign-in timeline and authentication result.',
      'Compare device, location, and MFA evidence.',
      'Contact the user through a trusted channel before taking action.',
    ],
  },
  {
    id: 'EVT-002',
    user: 'sam@example.test',
    type: 'Mailbox rule created',
    severity: 'Medium',
    time: '09:37',
    detail:
      'A new rule forwards messages outside the organization. Check the destination, audit history, and business context.',
    steps: [
      'Inspect the rule and its destination.',
      'Check related sign-ins and mailbox activity.',
      'Confirm whether the user created the rule.',
    ],
  },
  {
    id: 'EVT-003',
    user: 'service@example.test',
    type: 'Scheduled API activity',
    severity: 'Low',
    time: '09:30',
    detail:
      'Application activity matches an established scheduled task. Verify the application identity and permissions before closing.',
    steps: [
      'Compare the activity with the expected schedule.',
      'Verify the service principal and permissions.',
      'Document the reason for the disposition.',
    ],
  },
];

// Mock data for tasks, SLAs, and routing

export const taskStatus = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  OVERDUE: 'Overdue'
};

export const taskPriority = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const slaStatus = {
  ON_TIME: 'On Time',
  AT_RISK: 'At Risk',
  BREACHED: 'Breached'
};

export const mockTasks = {
  'UW-2026-001': [
    {
      id: 'TASK-001',
      title: 'Review Medical Exam Results',
      description: 'Analyze medical exam findings and lab results for diabetes management',
      status: taskStatus.COMPLETED,
      priority: taskPriority.HIGH,
      assignedTo: 'Sarah Chen',
      createdDate: '2026-01-22 09:30 AM',
      dueDate: '2026-01-22 05:00 PM',
      completedDate: '2026-01-22 10:30 AM',
      category: 'Medical Review',
      estimatedTime: '1 hour',
      actualTime: '45 minutes',
      sla: {
        target: '8 hours',
        remaining: null,
        status: slaStatus.ON_TIME
      }
    },
    {
      id: 'TASK-002',
      title: 'Request Attending Physician Statement',
      description: 'Obtain APS from Dr. Sarah Chen regarding diabetes treatment history',
      status: taskStatus.IN_PROGRESS,
      priority: taskPriority.HIGH,
      assignedTo: 'Sarah Chen',
      createdDate: '2026-01-22 11:30 AM',
      dueDate: '2026-01-24 05:00 PM',
      completedDate: null,
      category: 'Requirements',
      estimatedTime: '2 hours',
      actualTime: null,
      sla: {
        target: '48 hours',
        remaining: '36 hours 30 minutes',
        status: slaStatus.ON_TIME
      }
    },
    {
      id: 'TASK-003',
      title: 'Financial Underwriting Review',
      description: 'Verify income documentation and coverage justification',
      status: taskStatus.COMPLETED,
      priority: taskPriority.MEDIUM,
      assignedTo: 'Michael Park',
      createdDate: '2026-01-22 10:00 AM',
      dueDate: '2026-01-23 05:00 PM',
      completedDate: '2026-01-22 02:15 PM',
      category: 'Financial Review',
      estimatedTime: '1.5 hours',
      actualTime: '1 hour 15 minutes',
      sla: {
        target: '24 hours',
        remaining: null,
        status: slaStatus.ON_TIME
      }
    },
    {
      id: 'TASK-004',
      title: 'Order Motor Vehicle Report',
      description: 'Request MVR from state DMV for driving history verification',
      status: taskStatus.PENDING,
      priority: taskPriority.LOW,
      assignedTo: 'System',
      createdDate: '2026-01-22 09:45 AM',
      dueDate: '2026-01-25 05:00 PM',
      completedDate: null,
      category: 'Third-Party Data',
      estimatedTime: '30 minutes',
      actualTime: null,
      sla: {
        target: '72 hours',
        remaining: '70 hours 15 minutes',
        status: slaStatus.ON_TIME
      }
    },
    {
      id: 'TASK-005',
      title: 'Calculate Risk Score',
      description: 'Run risk assessment model with all available data',
      status: taskStatus.COMPLETED,
      priority: taskPriority.CRITICAL,
      assignedTo: 'Risk Engine',
      createdDate: '2026-01-22 10:15 AM',
      dueDate: '2026-01-22 11:00 AM',
      completedDate: '2026-01-22 10:32 AM',
      category: 'Risk Assessment',
      estimatedTime: '15 minutes',
      actualTime: '17 minutes',
      sla: {
        target: '1 hour',
        remaining: null,
        status: slaStatus.ON_TIME
      }
    },
    {
      id: 'TASK-006',
      title: 'Generate Quote',
      description: 'Create initial quote based on risk assessment and underwriting guidelines',
      status: taskStatus.PENDING,
      priority: taskPriority.HIGH,
      assignedTo: 'Sarah Chen',
      createdDate: '2026-01-22 02:30 PM',
      dueDate: '2026-01-23 12:00 PM',
      completedDate: null,
      category: 'Quoting',
      estimatedTime: '1 hour',
      actualTime: null,
      sla: {
        target: '24 hours',
        remaining: '21 hours 30 minutes',
        status: slaStatus.ON_TIME
      }
    }
  ],
  'UW-2026-003': [
    {
      id: 'TASK-101',
      title: 'Senior Underwriter Review Required',
      description: 'Complex medical history requires senior UW approval',
      status: taskStatus.IN_PROGRESS,
      priority: taskPriority.CRITICAL,
      assignedTo: 'James Wilson',
      createdDate: '2026-01-20 10:00 AM',
      dueDate: '2026-01-22 05:00 PM',
      completedDate: null,
      category: 'Escalation',
      estimatedTime: '2 hours',
      actualTime: null,
      sla: {
        target: '48 hours',
        remaining: '5 hours',
        status: slaStatus.AT_RISK
      }
    },
    {
      id: 'TASK-102',
      title: 'Reinsurance Evaluation',
      description: 'Coverage amount exceeds retention - reinsurance review needed',
      status: taskStatus.PENDING,
      priority: taskPriority.HIGH,
      assignedTo: 'Reinsurance Team',
      createdDate: '2026-01-20 02:00 PM',
      dueDate: '2026-01-23 05:00 PM',
      completedDate: null,
      category: 'Reinsurance',
      estimatedTime: '3 hours',
      actualTime: null,
      sla: {
        target: '72 hours',
        remaining: '51 hours',
        status: slaStatus.ON_TIME
      }
    }
  ]
};

export const submissionSLAs = {
  'UW-2026-001': {
    submissionAge: '12 hours 45 minutes',
    timeToFirstDecision: {
      target: '5 days',
      elapsed: '12 hours',
      remaining: '4 days 12 hours',
      percentComplete: 10,
      status: slaStatus.ON_TIME
    },
    timeToQuote: {
      target: '3 days',
      elapsed: '12 hours',
      remaining: '2 days 12 hours',
      percentComplete: 17,
      status: slaStatus.ON_TIME
    },
    requirementsCompletion: {
      target: '2 days',
      elapsed: '12 hours',
      remaining: '1 day 12 hours',
      percentComplete: 25,
      status: slaStatus.ON_TIME
    }
  },
  'UW-2026-003': {
    submissionAge: '2 days 7 hours',
    timeToFirstDecision: {
      target: '5 days',
      elapsed: '2 days 7 hours',
      remaining: '2 days 17 hours',
      percentComplete: 47,
      status: slaStatus.AT_RISK
    },
    timeToQuote: {
      target: '3 days',
      elapsed: '2 days 7 hours',
      remaining: '17 hours',
      percentComplete: 77,
      status: slaStatus.AT_RISK
    },
    requirementsCompletion: {
      target: '2 days',
      elapsed: '2 days 7 hours',
      remaining: '-7 hours',
      percentComplete: 116,
      status: slaStatus.BREACHED
    }
  }
};

export const routingRules = {
  'UW-2026-001': {
    routingType: 'Auto-Route',
    routedTo: 'Sarah Chen',
    routingReason: 'Standard case matching underwriter expertise',
    routingDate: '2026-01-22 09:30 AM',
    workload: 'Light (8 cases)',
    delegatedAuthority: false
  },
  'UW-2026-003': {
    routingType: 'Escalation',
    routedTo: 'James Wilson (Senior UW)',
    routingReason: 'Multiple medical conditions + high coverage amount',
    routingDate: '2026-01-20 10:00 AM',
    workload: 'Moderate (12 cases)',
    delegatedAuthority: false
  }
};

export const getTaskStatusColor = (status) => {
  switch (status) {
    case taskStatus.COMPLETED:
      return 'success';
    case taskStatus.IN_PROGRESS:
      return 'info';
    case taskStatus.PENDING:
      return 'neutral';
    case taskStatus.BLOCKED:
      return 'warning';
    case taskStatus.OVERDUE:
      return 'error';
    default:
      return 'neutral';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case taskPriority.CRITICAL:
      return 'error';
    case taskPriority.HIGH:
      return 'warning';
    case taskPriority.MEDIUM:
      return 'info';
    case taskPriority.LOW:
      return 'success';
    default:
      return 'neutral';
  }
};

export const getSLAStatusColor = (status) => {
  switch (status) {
    case slaStatus.ON_TIME:
      return '#24A148';
    case slaStatus.AT_RISK:
      return '#FF6B00';
    case slaStatus.BREACHED:
      return '#D0021B';
    default:
      return 'var(--color-fg-neutral-dark)';
  }
};

export const workflowSteps = [
  {
    step: 1,
    name: 'Submission Received',
    status: 'completed',
    completedDate: '2026-01-22 09:15 AM',
    completedBy: 'System'
  },
  {
    step: 2,
    name: 'Initial Triage & Routing',
    status: 'completed',
    completedDate: '2026-01-22 09:30 AM',
    completedBy: 'Auto-Routing Engine'
  },
  {
    step: 3,
    name: 'Requirements Gathering',
    status: 'in_progress',
    completedDate: null,
    completedBy: null
  },
  {
    step: 4,
    name: 'Risk Assessment',
    status: 'pending',
    completedDate: null,
    completedBy: null
  },
  {
    step: 5,
    name: 'Underwriting Decision',
    status: 'pending',
    completedDate: null,
    completedBy: null
  },
  {
    step: 6,
    name: 'Quote Generation',
    status: 'pending',
    completedDate: null,
    completedBy: null
  },
  {
    step: 7,
    name: 'Approval & Binding',
    status: 'pending',
    completedDate: null,
    completedBy: null
  }
];

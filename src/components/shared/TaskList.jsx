import {
  DxcFlex,
  DxcTypography,
  DxcHeading,
  DxcBadge,
  DxcButton,
  DxcCheckbox,
  DxcProgressBar,
} from '@dxc-technology/halstack-react';
import { getTaskStatusColor, getPriorityColor, getSLAStatusColor } from '../../data/mockTasks';

const TaskList = ({ tasks, showCompleted = true, compact = false }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-padding-m)', textAlign: 'center' }}>
        <DxcTypography color="var(--color-fg-neutral-dark)">
          No tasks assigned
        </DxcTypography>
      </div>
    );
  }

  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter(t => t.status !== 'Completed');

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Medical Review':
        return 'local_hospital';
      case 'Requirements':
        return 'checklist';
      case 'Financial Review':
        return 'account_balance';
      case 'Third-Party Data':
        return 'cloud_download';
      case 'Risk Assessment':
        return 'assessment';
      case 'Quoting':
        return 'request_quote';
      case 'Escalation':
        return 'flag';
      case 'Reinsurance':
        return 'shield';
      default:
        return 'task';
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    overdue: tasks.filter(t => t.status === 'Overdue').length
  };

  const completionRate = Math.round((taskStats.completed / taskStats.total) * 100);

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      {!compact && (
        <>
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcHeading level={4} text="Tasks" />
            <DxcTypography fontSize="font-scale-03" color="#0095FF">
              {taskStats.completed} of {taskStats.total} Complete
            </DxcTypography>
          </DxcFlex>

          {/* Progress Bar */}
          <div>
            <DxcProgressBar
              value={completionRate}
              showValue={true}
            />
          </div>

          {/* Task Stats */}
          <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
            <div
              style={{
                padding: 'var(--spacing-padding-s)',
                backgroundColor: 'var(--color-bg-neutral-lighter)',
                borderRadius: 'var(--border-radius-s)',
                flex: 1,
                minWidth: '120px'
              }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#0095FF">
                  {taskStats.inProgress}
                </DxcTypography>
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                  In Progress
                </DxcTypography>
              </DxcFlex>
            </div>
            <div
              style={{
                padding: 'var(--spacing-padding-s)',
                backgroundColor: 'var(--color-bg-neutral-lighter)',
                borderRadius: 'var(--border-radius-s)',
                flex: 1,
                minWidth: '120px'
              }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
                  {taskStats.pending}
                </DxcTypography>
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                  Pending
                </DxcTypography>
              </DxcFlex>
            </div>
            {taskStats.overdue > 0 && (
              <div
                style={{
                  padding: 'var(--spacing-padding-s)',
                  backgroundColor: 'var(--color-bg-error-lightest)',
                  borderRadius: 'var(--border-radius-s)',
                  flex: 1,
                  minWidth: '120px'
                }}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                  <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#D0021B">
                    {taskStats.overdue}
                  </DxcTypography>
                  <DxcTypography fontSize="12px" color="#D0021B">
                    Overdue
                  </DxcTypography>
                </DxcFlex>
              </div>
            )}
          </DxcFlex>
        </>
      )}

      {/* Task List */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        {filteredTasks.map((task, index) => (
          <div
            key={task.id}
            style={{
              padding: compact ? 'var(--spacing-padding-s)' : 'var(--spacing-padding-m)',
              backgroundColor: task.status === 'Completed'
                ? 'var(--color-bg-success-lightest)'
                : task.sla?.status === 'At Risk'
                ? 'var(--color-bg-warning-lightest)'
                : task.sla?.status === 'Breached'
                ? 'var(--color-bg-error-lightest)'
                : 'var(--color-bg-neutral-lightest)',
              borderRadius: 'var(--border-radius-s)',
              borderLeft: `4px solid ${getSLAStatusColor(task.sla?.status || 'On Time')}`
            }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {/* Task Header */}
              <DxcFlex justifyContent="space-between" alignItems="flex-start">
                <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start" grow={1}>
                  {!compact && (
                    <DxcCheckbox
                      checked={task.status === 'Completed'}
                      onChange={() => {}}
                    />
                  )}
                  <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                    <DxcFlex gap="var(--spacing-gap-s)" alignItems="center" wrap="wrap">
                      <span className="material-icons" style={{ fontSize: '20px', color: '#0095FF' }}>
                        {getCategoryIcon(task.category)}
                      </span>
                      <DxcTypography
                        fontSize="font-scale-03"
                        fontWeight="font-weight-semibold"
                        style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}
                      >
                        {task.title}
                      </DxcTypography>
                    </DxcFlex>
                    {!compact && (
                      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                        {task.description}
                      </DxcTypography>
                    )}
                  </DxcFlex>
                </DxcFlex>

                <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                  <DxcBadge
                    label={task.priority}
                    mode="contextual"
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                  <DxcBadge
                    label={task.status}
                    mode="contextual"
                    color={getTaskStatusColor(task.status)}
                    size="small"
                  />
                </DxcFlex>
              </DxcFlex>

              {/* Task Details */}
              {!compact && (
                <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                  <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-neutral-dark)' }}>
                      person
                    </span>
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                      {task.assignedTo}
                    </DxcTypography>
                  </DxcFlex>
                  <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-neutral-dark)' }}>
                      schedule
                    </span>
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                      Due: {task.dueDate}
                    </DxcTypography>
                  </DxcFlex>
                  {task.sla && task.sla.remaining && (
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '16px', color: getSLAStatusColor(task.sla.status) }}>
                        timer
                      </span>
                      <DxcTypography fontSize="12px" color={getSLAStatusColor(task.sla.status)}>
                        SLA: {task.sla.remaining}
                      </DxcTypography>
                    </DxcFlex>
                  )}
                  {task.completedDate && (
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '16px', color: '#24A148' }}>
                        check_circle
                      </span>
                      <DxcTypography fontSize="12px" color="#24A148">
                        Completed: {task.completedDate}
                      </DxcTypography>
                    </DxcFlex>
                  )}
                </DxcFlex>
              )}
            </DxcFlex>
          </div>
        ))}
      </DxcFlex>
    </DxcFlex>
  );
};

export default TaskList;

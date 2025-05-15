
import { OnboardingStatus } from '@/hooks/useOnboardingProgress';

export const allStepsCompleted = (status: OnboardingStatus) => {
  return (
    status.profile_completed &&
    status.clients_added &&
    status.services_added &&
    status.budget_created
  );
};

export const getCompletedSteps = (status: OnboardingStatus | null) => {
  if (!status) return 0;
  let count = 0;
  if (status.profile_completed) count++;
  if (status.clients_added) count++;
  if (status.services_added) count++;
  if (status.budget_created) count++;
  return count;
};

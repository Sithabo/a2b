import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiErrorMessage } from '@a2b/api-client';
import { useAppSession } from '../session/session_context.tsx';

/**
 * Every app keys its load queries under this root (["loads", "board"],
 * ["loads", id], …), so one invalidation after a mutation refreshes every
 * list and detail screen that shows the load.
 */
export const LOADS_QUERY_ROOT = ['loads'] as const;

export interface LoadMutationOptions {
  /** Title of the alert shown if the action fails, or `false` to handle errors in the screen. */
  errorTitle?: string | false;
}

function useLoadMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  defaultErrorTitle: string,
  { errorTitle = defaultErrorTitle }: LoadMutationOptions
) {
  const { queryClient } = useAppSession();
  return useMutation({
    mutationFn,
    // Stays pending until the refetches are in, so screens never show stale status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOADS_QUERY_ROOT }),
    onError: errorTitle === false ? undefined : (error) => Alert.alert(errorTitle, apiErrorMessage(error)),
  });
}

/** A driver takes an open load, or a fleet owner dispatches one of their trucks to it. */
export function useAcceptLoad(loadId: number, options: LoadMutationOptions = {}) {
  const { api } = useAppSession();
  return useLoadMutation(
    (body: { vehicleId?: number } = {}) => api.loads.accept({ params: { id: loadId }, body }),
    "Couldn't accept this load",
    options
  );
}

/** The carrier hands an accepted load back to the board. */
export function useWithdrawLoad(loadId: number, options: LoadMutationOptions = {}) {
  const { api } = useAppSession();
  return useLoadMutation(() => api.loads.withdraw({ params: { id: loadId } }), "Couldn't withdraw", options);
}

/** The driver confirms the cargo is loaded or has arrived. */
export function useProgressLoad(loadId: number, options: LoadMutationOptions = {}) {
  const { api } = useAppSession();
  return useLoadMutation(
    (status: 'IN_TRANSIT' | 'DELIVERED') => api.loads.progress({ params: { id: loadId }, body: { status } }),
    "Couldn't update the job",
    options
  );
}

/** The driver enters the shipper's release code to pay out the escrow. */
export function useReleaseEscrow(loadId: number, options: LoadMutationOptions = {}) {
  const { api } = useAppSession();
  return useLoadMutation(
    (code: string) => api.escrow.release({ params: { id: loadId }, body: { code } }),
    "Couldn't release the payment",
    options
  );
}

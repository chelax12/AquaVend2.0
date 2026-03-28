import { supabase } from '../../lib/supabase';

export interface ClaimDeviceResult {
  success: boolean;
  unit_id?: string;
  error?: string;
}

/**
 * Maps Supabase RPC error messages to user-friendly strings.
 */
export const mapActivationError = (error: any): string => {
  if (!error) return 'An unknown error occurred.';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('invalid activation code')) {
    return 'The activation code you entered is invalid.';
  }
  if (message.includes('already used')) {
    return 'This activation code has already been used.';
  }
  if (message.includes('already registered')) {
    return 'This device is already registered to another user.';
  }
  
  return error.message || 'Failed to claim device. Please try again.';
};

/**
 * Shared logic to claim a device using an activation code.
 */
export const claimDevice = async (code: string): Promise<ClaimDeviceResult> => {
  try {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Activation code is required.' };
    }

    const { data, error } = await supabase.rpc('claim_device', {
      p_code: cleanCode
    });

    if (error) {
      return { success: false, error: mapActivationError(error) };
    }

    return { 
      success: true, 
      unit_id: data?.unit_id 
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
};

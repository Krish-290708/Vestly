'use client';

import React from 'react';
import GrantStepperModal from './GrantStepperModal';

export interface GrantIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function GrantIntakeModal(props: GrantIntakeModalProps) {
  return <GrantStepperModal {...props} />;
}

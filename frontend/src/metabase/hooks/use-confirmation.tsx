import { useState } from "react";
import { t } from "ttag";

import ConfirmContent from "metabase/components/ConfirmContent";
import Modal from "metabase/components/Modal";
import type { ModalProps } from "metabase/components/Modal/Modal";

export type ConfirmationState = {
  title: string;
  message?: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

export const useConfirmation = ({
  modalProps,
}: {
  modalProps?: ModalProps;
} = {}) => {
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState | null>(null);

  const handleClose = () => {
    setConfirmationState(null);
  };

  const modalContent = confirmationState ? (
    <Modal isOpen onClose={handleClose} {...modalProps}>
      <ConfirmContent
        title={confirmationState.title}
        message={confirmationState?.message}
        confirmButtonText={confirmationState.confirmButtonText}
        cancelButtonText={confirmationState.cancelButtonText}
        onClose={handleClose}
        onAction={confirmationState.onConfirm}
      />
    </Modal>
  ) : null;

  const show = ({
    title,
    message,
    onConfirm,
    confirmButtonText = t`Confirm`,
    cancelButtonText = t`Cancel`,
  }: ConfirmationState) =>
    setConfirmationState({
      title,
      message,
      onConfirm,
      confirmButtonText,
      cancelButtonText,
    });

  return { modalContent, show };
};

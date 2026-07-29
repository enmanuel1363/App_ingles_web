"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmationModal from "./ConfirmationModal";
import AlertModal, { AlertType } from "./AlertModal";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "secondary";
}

interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
}

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  // Confirm modal state
  const [confirmState, setConfirmState] = useState<{
    visible: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  // Alert modal state
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        visible: true,
        options,
        resolve,
      });
    });
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setAlertState({
        visible: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = () => {
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  };

  const handleConfirmAction = () => {
    if (confirmState) {
      confirmState.resolve(true);
      setConfirmState(null);
    }
  };

  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve();
      setAlertState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, showAlert }}>
      {children}
      {confirmState && (
        <ConfirmationModal
          visible={confirmState.visible}
          onClose={handleConfirmClose}
          onConfirm={handleConfirmAction}
          title={confirmState.options.title}
          description={confirmState.options.description}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          variant={confirmState.options.variant}
        />
      )}
      {alertState && (
        <AlertModal
          visible={alertState.visible}
          onClose={handleAlertClose}
          title={alertState.options.title}
          message={alertState.options.message}
          type={alertState.options.type}
          buttonText={alertState.options.buttonText}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

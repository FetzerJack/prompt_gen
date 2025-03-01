'use client';

import React from 'react';

/**
 * Reusable Modal component for displaying styled messages and actions.
 * @param {object} { isOpen, onClose, message, actionButton } - Props for modal visibility, close handler, message, and optional action button.
 *        actionButton should be an object: { label: string, onClick: function }
 * @returns {JSX.Element|null} Modal component or null if not open.
 */
const Modal = ({ isOpen, onClose, message, actionButton }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none bg-gray-500 bg-opacity-75 backdrop-blur-sm">
      <div className="relative w-auto max-w-5xl mx-auto my-6"> {/* Increased max-w to 5xl for a larger modal */}
        {/* Modal content */}
        <div className="bg-background border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
            <h3 className="text-xl font-semibold text-gray-200">
              Notification
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/* Body */}
          <div className="relative p-6 flex-auto max-h-[80vh] overflow-y-auto"> {/* Increased max-h to 80vh for larger body and kept scroll */}
            <p className="my-4 text-gray-200 text-lg leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
            {actionButton && ( // Conditionally render action button
              <button
                className="bg-primary text-white active:bg-primary-dark font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={actionButton.onClick}
              >
                {actionButton.label}
              </button>
            )}
            <button
              className="bg-accent text-gray-200 active:bg-accent-dark font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sidebar component for displaying prompts, search, and add new functionality using Prisma backend.
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = React.forwardRef(({ onSelectPrompt }, ref) => {
  const [prompts, setPrompts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletePromptId, setDeletePromptId] = useState(null);

  /**
   * Function to load prompts from the API using Prisma.
   */
  const loadPromptsFromLocalStorage = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts from API:', error);
      setError('Failed to load prompts');
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Function to handle adding a new prompt using Prisma.
   */
  const handleAddNewPrompt = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Prompt' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newPrompt = await response.json();
      setPrompts(prevPrompts => [...prevPrompts, newPrompt]);
      if (onSelectPrompt) {
        onSelectPrompt(newPrompt);
      }
    } catch (error) {
      console.error('Error adding new prompt:', error);
      setError('Failed to create new prompt');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Function to show deletion confirmation
   * @param {string} id - ID of the prompt to potentially delete
   * @param {Event} e - Event object
   */
  const confirmDeletePrompt = (id, e) => {
    e.stopPropagation(); // Prevent triggering the prompt selection
    setDeletePromptId(id);
  };

  /**
   * Function to cancel prompt deletion
   */
  const cancelDeletePrompt = () => {
    setDeletePromptId(null);
  };

  /**
   * Function to handle deleting a prompt using Prisma.
   */
  const handleDeletePromptConfirmed = async () => {
    if (!deletePromptId) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/prompts/${deletePromptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedPrompts = prompts.filter(prompt => prompt.id !== deletePromptId);
      setPrompts(updatedPrompts);

      let nextSelectedPrompt = null;
      const deletedPromptIndex = prompts.findIndex(prompt => prompt.id === deletePromptId);
      if (updatedPrompts.length > 0) {
        if (deletedPromptIndex < updatedPrompts.length) {
          nextSelectedPrompt = updatedPrompts[deletedPromptIndex];
        } else {
          nextSelectedPrompt = updatedPrompts[updatedPrompts.length - 1];
        }
      }
      if (onSelectPrompt) {
        onSelectPrompt(nextSelectedPrompt);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      setError('Failed to delete prompt');
    } finally {
      setIsLoading(false);
      setDeletePromptId(null);
    }
  };

  useEffect(() => {
    loadPromptsFromLocalStorage();
  }, [loadPromptsFromLocalStorage]);

  useImperativeHandle(ref, () => ({
    loadPromptsFromLocalStorage: loadPromptsFromLocalStorage,
  }));

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const filteredPrompts = searchTerm
    ? prompts.filter(prompt => prompt.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : prompts;

  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col h-full overflow-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Prompt Engine</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search prompts..."
          className="w-full px-3 py-2 border rounded border-gray-600 focus:ring focus:ring-primary focus:border-primary text-gray-800 bg-white"
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-900 text-white rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex-grow overflow-y-auto mb-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-10">
            <div className="animate-pulse text-white">Loading...</div>
          </div>
        )}

        {filteredPrompts.length > 0 ? (
          <ul className="space-y-2">
            {filteredPrompts.map(prompt => (
              <li
                key={prompt.id}
                className="p-2 rounded hover:bg-gray-700 flex justify-between items-center group transition-colors"
              >
                <span
                  className="cursor-pointer text-gray-200 truncate flex-grow"
                  onClick={() => onSelectPrompt(prompt)}
                  title={prompt.title}
                >
                  {prompt.title}
                </span>
                <button
                  onClick={(e) => confirmDeletePrompt(prompt.id, e)}
                  className="text-red-400 hover:text-red-300 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete prompt"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : searchTerm ? (
          <p className="text-sm text-gray-400">No prompts found matching "{searchTerm}"</p>
        ) : (
          <p className="text-sm text-gray-400">No prompts yet. Add new to get started.</p>
        )}
      </div>

      <div>
        <button
          className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary-dark focus:ring focus:ring-primary focus:ring-opacity-50 transition-colors"
          onClick={handleAddNewPrompt}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : '+ Add New Prompt'}
        </button>
      </div>

      {deletePromptId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-2 text-white">Delete Prompt</h3>
            <p className="mb-4 text-gray-300">Are you sure you want to delete this prompt? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={cancelDeletePrompt}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeletePromptConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
});

export default React.memo(Sidebar);

'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { v4 as uuidv4 } from 'uuid';

/**
 * PromptEditor component for viewing and editing prompt details using Prisma backend.
 * @param {object} { selectedPrompt, onPromptUpdated } - Props containing selected prompt and update handler.
 * @returns {JSX.Element} PromptEditor component
 */
const PromptEditor = ({ selectedPrompt, onPromptUpdated }) => {
  const [currentPrompt, setCurrentPrompt] = useState(selectedPrompt);
  const [newInstruction, setNewInstruction] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionBody, setNewSectionBody] = useState('');
  const [isSaveAsNewModalOpen, setIsSaveAsNewModalOpen] = useState(false);
  const [isGenerateXmlModalOpen, setIsGenerateXmlModalOpen] = useState(false);
  const [xmlOutput, setXmlOutput] = useState('');
  const [clipboardMessage, setClipboardMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, type: '', index: -1 });

  // State to track editing indices and values
  const [editingInstructionIndex, setEditingInstructionIndex] = useState(-1);
  const [editingInstructionText, setEditingInstructionText] = useState('');
  const [editingSectionIndex, setEditingSectionIndex] = useState(-1);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [editingSectionBody, setEditingSectionBody] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTitleText, setEditingTitleText] = useState('');



  useEffect(() => {
    setCurrentPrompt(selectedPrompt);
  }, [selectedPrompt]);

  const handleTitleChange = event => {
    const updatedTitle = event.target.value;
    setCurrentPrompt(prevPrompt => ({ ...prevPrompt, title: updatedTitle }));
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim() !== '') {
      const updatedInstructions = [...currentPrompt.instructions, { text: newInstruction.trim() }];
      setCurrentPrompt(prevPrompt => ({ ...prevPrompt, instructions: updatedInstructions }));
      setNewInstruction('');
    }
  };

  const handleNewInstructionChange = event => {
    setNewInstruction(event.target.value);
  };

  const handleNewSectionTitleChange = event => {
    setNewSectionTitle(event.target.value);
  };

  const handleNewSectionBodyChange = event => {
    setNewSectionBody(event.target.value);
  };

  const handleAddCustomSection = () => {
    if (newSectionTitle.trim() !== '') {
      const newSection = {
        title: newSectionTitle.trim(),
        body: newSectionBody.trim(),
      };
      const updatedCustomSections = [...currentPrompt.sections, newSection];
      setCurrentPrompt(prevPrompt => ({ ...prevPrompt, sections: updatedCustomSections }));
      setNewSectionTitle('');
      setNewSectionBody('');
    }
  };

  const confirmDelete = (type, index) => {
    setDeleteConfirmation({ show: true, type, index });
  };

  const handleDeleteConfirmed = () => {
    const { type, index } = deleteConfirmation;

    if (type === 'instruction') {
      const updatedInstructions = currentPrompt.instructions.filter((_, i) => i !== index);
      setCurrentPrompt(prevPrompt => ({ ...prevPrompt, instructions: updatedInstructions }));
    } else if (type === 'section') {
      const updatedSections = currentPrompt.sections.filter((_, i) => i !== index);
      setCurrentPrompt(prevPrompt => ({ ...prevPrompt, sections: updatedSections }));
    }

    setDeleteConfirmation({ show: false, type: '', index: -1 });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, type: '', index: -1 });
  };

  // These functions now trigger confirmation dialogs
  const handleDeleteInstruction = index => {
    confirmDelete('instruction', index);
  };

  const handleDeleteCustomSection = index => {
    confirmDelete('section', index);
  };

  const handleInstructionChange = (indexToChange, newText) => {
    const updatedInstructions = currentPrompt.instructions.map((instruction, index) =>
      index === indexToChange ? { ...instruction, text: newText } : instruction
    );
    setCurrentPrompt(prevPrompt => ({ ...prevPrompt, instructions: updatedInstructions }));
  };

  const handleSectionTitleChange = (indexToChange, newTitle) => {
    const updatedSections = currentPrompt.sections.map((section, index) =>
      index === indexToChange ? { ...section, title: newTitle } : section
    );
    setCurrentPrompt(prevPrompt => ({ ...prevPrompt, sections: updatedSections }));
  };

  const handleSectionBodyChange = (indexToChange, newBody) => {
    const updatedSections = currentPrompt.sections.map((section, index) =>
      index === indexToChange ? { ...section, body: newBody } : section
    );
    setCurrentPrompt(prevPrompt => ({ ...prevPrompt, sections: updatedSections }));
  };

  // Edit mode handlers
  const enableEditInstruction = (index) => {
    setEditingInstructionIndex(index);
    setEditingInstructionText(currentPrompt.instructions[index].text);
  };

  const cancelEditInstruction = () => {
    setEditingInstructionIndex(-1);
  };

  const saveEditInstruction = (index) => {
    handleInstructionChange(index, editingInstructionText);
    setEditingInstructionIndex(-1);
  };

  const enableEditSection = (index) => {
    setEditingSectionIndex(index);
    setEditingSectionTitle(currentPrompt.sections[index].title);
    setEditingSectionBody(currentPrompt.sections[index].body);
  };

  const cancelEditSection = () => {
    setEditingSectionIndex(-1);
  };

  const saveEditSection = (index) => {
    handleSectionTitleChange(index, editingSectionTitle);
    handleSectionBodyChange(index, editingSectionBody);
    setEditingSectionIndex(-1);
  };

  const enableEditTitle = () => {
    setEditingTitle(true);
    setEditingTitleText(currentPrompt.title);
  };

  const cancelEditTitle = () => {
    setEditingTitle(false);
  };

  const saveEditTitle = () => {
    setCurrentPrompt(prevPrompt => ({ ...prevPrompt, title: editingTitleText }));
    setEditingTitle(false);
  };


  const savePrompt = async () => {
    if (!currentPrompt) {
      setErrorMessage('No prompt to save.');
      return;
    }

    if (!currentPrompt.title || currentPrompt.title.trim() === '') {
      setErrorMessage('Prompt must have a title');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/prompts/${currentPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentPrompt.title,
          objective: currentPrompt.objective || '',
          instructions: currentPrompt.instructions.map(inst => inst.text),
          customSections: currentPrompt.sections,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedPrompt = await response.json();
      setCurrentPrompt(updatedPrompt);
      if (onPromptUpdated) {
        onPromptUpdated(updatedPrompt);
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
      setErrorMessage(`Failed to save: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsNewPrompt = async () => {
    if (!currentPrompt) {
      setErrorMessage('No prompt to duplicate.');
      return;
    }

    if (!currentPrompt.title || currentPrompt.title.trim() === '') {
      setErrorMessage('Prompt must have a title before duplicating');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create new prompt
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${currentPrompt.title} - Copy`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newPrompt = await response.json();

      // Update the new prompt with all data from current prompt
      const updateResponse = await fetch(`/api/prompts/${newPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${currentPrompt.title} - Copy`,
          objective: currentPrompt.objective || '',
          instructions: currentPrompt.instructions.map(inst => inst.text),
          customSections: currentPrompt.sections,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || `HTTP error during update! status: ${updateResponse.status}`);
      }

      const savedNewPrompt = await updateResponse.json();

      setCurrentPrompt(savedNewPrompt);
      if (onPromptUpdated) {
        onPromptUpdated(savedNewPrompt);
      }
      setIsSaveAsNewModalOpen(true);
    } catch (error) {
      console.error('Error saving prompt as new:', error);
      setErrorMessage(`Failed to duplicate: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateXml = () => {
    if (!currentPrompt) return '';

    let xmlString = '<prompt>\n';
    xmlString += '<objective>';
    xmlString += currentPrompt.objective ? currentPrompt.objective : '';
    xmlString += '</objective>\n';
    xmlString += '<instructions>\n';
    const instructionsArray = currentPrompt.instructions || [];
    if (instructionsArray.length > 0) {
      instructionsArray.forEach(instruction => {
        xmlString += `\t<instruction>${instruction.text}</instruction>\n`;
      });
    }
    xmlString += '</instructions>\n';
    const sectionsArray = currentPrompt.sections || [];
    if (sectionsArray.length > 0) {
      sectionsArray.forEach(section => {
        xmlString += `<${section.title}>\n`;
        if (typeof section.body === 'string') {
          xmlString += `\t\t${section.body}\n`;
        } else if (Array.isArray(section.body)) {
          section.body.forEach(item => {
            xmlString += `\t\t<item>${item}</item>\n`;
          });
        }
        xmlString += `</${section.title}>\n`;
      });
    }
    xmlString += '</prompt>';
    return xmlString;
  };

  const handleGenerateXml = () => {
    const output = generateXml();
    setXmlOutput(output);
    setIsGenerateXmlModalOpen(true);
    setClipboardMessage('');
  };

  const closeSaveAsNewModal = () => {
    setIsSaveAsNewModalOpen(false);
  };

  const closeGenerateXmlModal = () => {
    setIsGenerateXmlModalOpen(false);
  };

  const handleCopyXmlToClipboard = async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(xmlOutput);
        setClipboardMessage('XML copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy XML to clipboard', err);
        setClipboardMessage('Failed to copy XML to clipboard. Please copy manually.');
      }
    } else {
      console.warn('navigator.clipboard API is not available in this environment.');
      setClipboardMessage('Clipboard access not available in this browser/environment. Please copy manually.');
    }
  };

  if (!currentPrompt) {
    return (
      <div className="p-6 text-gray-800">
        <p className="text-gray-500">Select a prompt from the sidebar to view and edit it here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        {editingTitle ? (
          <div className="w-1/2 flex flex-col">
            <input
              type="text"
              placeholder="Prompt Title"
              className="text-xl font-bold p-2 border rounded border-gray-300 focus:ring focus:ring-primary focus:border-primary text-gray-800 bg-white"
              value={editingTitleText}
              onChange={(e) => setEditingTitleText(e.target.value)}
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={cancelEditTitle}
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveEditTitle}
                className="px-2 py-1 bg-primary text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center">
            <h1 className="text-xl font-bold text-white">
              {currentPrompt?.title || 'Untitled'}
            </h1>
            <button
              onClick={enableEditTitle}
              className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
              aria-label="Edit title"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v5h-5l-1.2-3.55M18 14l-2.5 2.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Objective</h3>
        <textarea
          className="w-full h-24 p-2 border rounded border-gray-300 focus:ring focus:ring-primary focus:border-primary text-gray-800 bg-white"
          placeholder="Enter objective..."
          value={currentPrompt.objective || ''}
          onChange={e => setCurrentPrompt({ ...currentPrompt, objective: e.target.value })}
        />
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
          <span>Instructions</span>
        </h3>
        {currentPrompt.instructions && currentPrompt.instructions.length > 0 ? (
          <ul>
            {currentPrompt.instructions.map((instruction, index) => (
              <li
                key={index}
                className="mb-1 p-2 border rounded border-gray-300 bg-gray-700 flex justify-between items-center"
              >
                {editingInstructionIndex === index ? ( // Render input if editing
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={editingInstructionText}
                      className="w-full p-2 border rounded focus:ring-primary focus:border-primary text-gray-800"
                      onChange={(e) => setEditingInstructionText(e.target.value)}
                      onBlur={() => saveEditInstruction(index)}
                    />
                    <div className="flex justify-end mt-1 space-x-2">
                      <button onClick={cancelEditInstruction} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Cancel</button>
                      <button onClick={() => saveEditInstruction(index)} className="px-2 py-1 bg-primary text-white rounded text-sm">Save</button>                    </div>
                  </div>
                ) : (  // Render view mode if not editing
                  <>
                    <span className="flex-grow">{instruction.text}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => enableEditInstruction(index)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        aria-label={`Edit instruction ${index + 1}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v5h-5l-1.2-3.55M18 14l-2.5 2.5" />
                        </svg>
                      </button>
                      <button

                        onClick={() => handleDeleteInstruction(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                        aria-label={`Delete instruction ${index + 1}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-gray-200">No instructions yet.</p>
        )}
        <div className="flex mt-2">
          <input
            type="text"
            placeholder="Add new instruction"
            className="flex-grow p-2 border rounded border-gray-300 focus:ring focus:ring-primary focus:border-primary mr-2 text-gray-800"
            value={newInstruction}
            onChange={handleNewInstructionChange}
          />
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:ring focus:ring-primary focus:ring-opacity-50"
            onClick={handleAddInstruction}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between text-gray-800">
          <span className="text-white">Custom Sections</span>
        </h3>
        {currentPrompt.sections && currentPrompt.sections.length > 0 ? (
          currentPrompt.sections.map((section, index) => (
            <div key={index} className="mb-4 p-4 border rounded border-gray-300">
              <div className="flex justify-between items-center">
                {editingSectionIndex === index ? ( // Render edit mode for section
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-200 flex-grow">{section.title}</h4>
                    <textarea
                      value={editingSectionBody}
                      placeholder="Section Body (text)"
                      className="w-full h-20 p-2 border rounded focus:ring-primary focus:border-primary text-gray-800"
                      onChange={(e) => setEditingSectionBody(e.target.value)}
                    />
                    <div className="flex justify-end mt-1 space-x-2">
                      <button onClick={cancelEditSection} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Cancel</button>
                      <button onClick={() => saveEditSection(index)} className="px-2 py-1 bg-primary text-white rounded text-sm">Save</button>
                    </div>
                  </div>
                ) : ( // Render view mode for section
                  <div className="w-full flex flex-col">
                    <div className="flex justify-end space-x-2">
                      <h4 className="font-semibold text-gray-200 flex-grow">{section.title}</h4>
                      <button
                        onClick={() => enableEditSection(index)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none ml-2"
                        aria-label={`Edit section ${section.title}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v5h-5l-1.2-3.55M18 14l-2.5 2.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCustomSection(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                        aria-label={`Delete section ${section.title}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-2 text-gray-200">
                      {(typeof section.body === 'string') ? (
                        <p className="text-gray-200">{section.body}</p>
                      ) : (
                        <ul>
                          {section.body.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="mb-1 p-2 border rounded border-gray-300 text-gray-800"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-gray-200">No custom sections yet.</p>
        )}
        <div className="mt-2 p-2 border rounded border-gray-300">
          <input
            type="text"
            placeholder="Section Title"
            className="w-full p-2 border-b border-gray-300 focus:ring-0 focus:border-primary mb-2 text-gray-800"
            value={newSectionTitle}
            onChange={handleNewSectionTitleChange}
          />
          <textarea
            placeholder="Section Body (text)"
            className="w-full h-20 p-2 focus:ring-0 focus:border-primary text-gray-800"
            value={newSectionBody}
            onChange={handleNewSectionBodyChange}
          />
          <div className="text-right mt-2">
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:ring focus:ring-primary focus:ring-opacity-50 text-gray-800"
              onClick={handleAddCustomSection}
            >
              Add Section
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark focus:ring focus:ring-secondary focus:ring-opacity-50"
          onClick={handleSaveAsNewPrompt}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Duplicate'}
        </button>
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:ring focus:ring-primary focus:ring-opacity-50"
          onClick={savePrompt}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark focus:ring focus:ring-accent focus:ring-opacity-50"
          onClick={handleGenerateXml}
          disabled={isLoading}
        >
          Generate XML
        </button>
      </div>

      <Modal
        isOpen={isSaveAsNewModalOpen}
        onClose={closeSaveAsNewModal}
        message="Prompt duplicated successfully!"
      />
      <Modal
        isOpen={isGenerateXmlModalOpen}
        onClose={closeGenerateXmlModal}
        message={`${xmlOutput}`}
        actionButton={{
          label: 'Copy to Clipboard',
          onClick: handleCopyXmlToClipboard,
        }}
      />
      <Modal
        isOpen={!!clipboardMessage}
        onClose={() => setClipboardMessage('')}
        message={clipboardMessage}
      />
      <Modal
        isOpen={deleteConfirmation.show}
        onClose={cancelDelete}
        message={`Are you sure you want to delete this ${deleteConfirmation.type}?`}
        actionButton={{
          label: 'Delete',
          onClick: handleDeleteConfirmed,
        }}
      />
    </div>
  );
};

export default PromptEditor;

'use client'; // Add 'use client' directive at the top

import React, { useState, useRef } from 'react';
import Sidebar from "./components/Sidebar";
import PromptEditor from "./components/PromptEditor";

/**
 * Home page component.
 * @returns {JSX.Element} Home component
 */
export default function Home() {
  /**
   * State to store the currently selected prompt.
   * Null means no prompt is selected.
   */
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const sidebarRef = useRef(null); // Create a ref for Sidebar

  /**
   * Function to handle selecting a prompt from the sidebar.
   * @param {object} prompt - The prompt object that was selected.
   */
  const handleSelectPrompt = (prompt) => {
    console.log("Prompt selected:", prompt);
    setSelectedPrompt(prompt);
  };
  /**
   * Function to handle when a prompt is updated in PromptEditor.
   * This can be used to refresh the sidebar if needed, or update any other relevant parts of the UI.
   * @param {object} updatedPrompt - The updated prompt object.
   */
  const handlePromptUpdated = (updatedPrompt) => {
    console.log("Prompt updated/created:", updatedPrompt);
    setSelectedPrompt(updatedPrompt);
    // Refresh prompts in sidebar after update
    // By calling loadPromptsFromLocalStorage in Sidebar via prop
    sidebarRef.current?.loadPromptsFromLocalStorage();
  };

  return (
    <div className="flex h-screen">
      <Sidebar onSelectPrompt={handleSelectPrompt} ref={sidebarRef} />

      <main className="flex-1 p-6 overflow-auto">
        <PromptEditor selectedPrompt={selectedPrompt} onPromptUpdated={handlePromptUpdated} />
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { Plus, ArrowUp } from "lucide-react";
import styles from "./ChatInput.module.css";

/**
 * ChatInput Component
 * Renders the text input form and submit button for sending messages.
 *
 * @param {Object} props
 * @param {boolean} props.isLoading - Disables input while waiting for API responses
 * @param {Function} props.handleSubmit - Callback function to submit prompt text
 */
function ChatInput({ isLoading, handleSubmit, error }) {
  // Initialize input state with an empty string to prevent uncontrolled input warnings
  const [input, setInput] = useState("");

  /**
   * Form submit handler
   * Prevents default page refresh and passes input up to App component
   */
  async function submitHandler(event) {
    event.preventDefault();

    // Prevent submission if string is empty or request is pending
    if (!input.trim() || isLoading) return;

    const submitted = await handleSubmit(input.trim());
    if (submitted) setInput("");
  }

  return (
    <div className={styles.container}>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <form className={styles.form} onSubmit={submitHandler}>
        {/* Attachment/Action Icon */}
        <div className={styles.icon}>
          <Plus size={20} />
        </div>

        {/* Text Input Field */}
        <input
          type="text"
          className={styles.input}
          placeholder="Ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading || !input.trim()}
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatInput;

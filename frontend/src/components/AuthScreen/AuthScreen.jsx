import { useState } from "react";
import { ArrowRight, Bot, LockKeyhole, Sparkles } from "lucide-react";
import axios from "axios";
import styles from "./AuthScreen.module.css";

// Render the sign-in and account-creation form.
function AuthScreen({ onAuthenticated, connectionError }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = mode === "signup";

  // Submit credentials and pass the authenticated account to the app.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await axios.post(
        `/auth/${mode}`,
        isSignUp ? { name, email, password } : { email, password },
      );
      onAuthenticated(data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't complete your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Switch between the sign-in and registration fields.
  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><Bot size={21} /></span>
          <span>ChatGPT</span>
        </div>
        <div className={styles.storyContent}>
          <div className={styles.eyebrow}><Sparkles size={15} /> Your ideas, in good company</div>
          <h1>A little more room to think.</h1>
          <p>
            Pick up where you left off, explore a new idea, or turn a question
            into something bigger.
          </p>
          <div className={styles.storyNote}>
            <div className={styles.noteDots}><span /><span /><span /></div>
            <p>“Help me find a fresh perspective.”</p>
            <span>One good question can take you anywhere.</span>
          </div>
        </div>
        <span className={styles.storyFooter}>A thoughtful space for curious minds.</span>
      </section>

      <section className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.mobileBrand}>
            <span className={styles.brandMark}><Bot size={21} /></span>
            <span>ChatGPT</span>
          </div>
          <div className={styles.formIcon}><LockKeyhole size={19} /></div>
          <h2>{isSignUp ? "Create your account" : "Welcome back"}</h2>
          <p className={styles.subtitle}>
            {isSignUp
              ? "A space for your next big idea starts here."
              : "Sign in to return to your conversations."}
          </p>

          <div className={styles.modeSwitch} aria-label="Account access">
            <button
              type="button"
              className={!isSignUp ? styles.modeActive : ""}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={isSignUp ? styles.modeActive : ""}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>

          {connectionError && <p className={styles.error} role="alert">{connectionError}</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}

          <form className={styles.form} onSubmit={handleSubmit}>
            {isSignUp && (
              <label className={styles.field}>
                <span>Your name</span>
                <input
                  autoComplete="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={60}
                  required
                />
              </label>
            )}
            <label className={styles.field}>
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input
                autoComplete={isSignUp ? "new-password" : "current-password"}
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isSignUp ? 8 : undefined}
                maxLength={128}
                required
              />
              {isSignUp && <small>Use at least 8 characters.</small>}
            </label>
            <button className={styles.submit} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className={styles.switchPrompt}>
            {isSignUp ? "Already have an account?" : "New to ChatGPT?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignUp ? "login" : "signup")}
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className={styles.privacy}>Your conversations are private to your account.</p>
        </div>
      </section>
    </main>
  );
}

export default AuthScreen;

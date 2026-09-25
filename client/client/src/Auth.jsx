import { useState } from "react";

const API_URL = "http://localhost:5000/api/auth";

export default function Auth({
  onLogin,
  onClose,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? `${API_URL}/login`
          : `${API_URL}/register`;

      const body =
        mode === "login"
          ? {
              email,
              password,
            }
          : {
              name,
              email,
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Something went wrong."
        );
      }

      localStorage.setItem(
        "tripnexus_token",
        data.token
      );

      localStorage.setItem(
        "tripnexus_user",
        JSON.stringify(data.user)
      );

      setSuccess(
        mode === "login"
          ? "Login successful! 🚀"
          : "Account created successfully! 🚀"
      );

      if (onLogin) {
        onLogin(data.user);
      }

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 700);

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to connect to TripNexus server."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(
      mode === "login"
        ? "register"
        : "login"
    );

    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div style={styles.overlay}>

      <div style={styles.card}>

        <button
          type="button"
          onClick={onClose}
          style={styles.close}
        >
          ×
        </button>

        <div style={styles.logo}>
          ✈️
        </div>

        <h2 style={styles.title}>
          {mode === "login"
            ? "Welcome back"
            : "Create your account"}
        </h2>

        <p style={styles.subtitle}>
          {mode === "login"
            ? "Login to continue planning smarter trips."
            : "Join TripNexus and start planning amazing journeys."}
        </p>

        <form onSubmit={handleSubmit}>

          {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={6}
              required
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submit,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login to TripNexus →"
              : "Create Account →"}
          </button>
        </form>

        <div style={styles.divider}>
          <span>OR</span>
        </div>

        <p style={styles.switchText}>

          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={switchMode}
            style={styles.switchButton}
          >
            {mode === "login"
              ? " Create one"
              : " Login"}
          </button>
        </p>

      </div>
    </div>
  );
}


// ======================================
// INLINE STYLES
// ======================================

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background:
      "rgba(15, 23, 42, 0.62)",
    backdropFilter: "blur(10px)",
  },

  card: {
    position: "relative",
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "36px",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.22)",
  },

  close: {
    position: "absolute",
    top: "16px",
    right: "18px",
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "50%",
    background: "#f1f5f9",
    color: "#334155",
    fontSize: "24px",
    cursor: "pointer",
  },

  logo: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f766e, #14b8a6)",
    fontSize: "25px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.2,
    color: "#0f172a",
  },

  subtitle: {
    margin:
      "10px 0 25px",
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  field: {
    marginBottom: "17px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
  },

  submit: {
    width: "100%",
    border: "none",
    borderRadius: "13px",
    padding: "14px 18px",
    background:
      "linear-gradient(135deg, #0f766e, #14b8a6)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "5px",
  },

  error: {
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#fff1f2",
    color: "#be123c",
    fontSize: "13px",
    marginBottom: "14px",
  },

  success: {
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "13px",
    marginBottom: "14px",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0 18px",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "600",
  },

  switchText: {
    textAlign: "center",
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  switchButton: {
    border: "none",
    background: "transparent",
    color: "#0f766e",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
  },
};
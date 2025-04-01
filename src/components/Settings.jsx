import React, { useState, useEffect } from "react";
import './Settings.css';

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");

  // Effect to apply the theme change globally
  useEffect(() => {
    document.body.className = theme; // Apply theme to body
  }, [theme]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleSave = () => {
    alert("Settings updated successfully!");
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-section">
        <label>Name:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>
      <div className="settings-section">
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="settings-section">
        <label>Theme:</label>
        <select value={theme} onChange={handleThemeChange}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default Settings;

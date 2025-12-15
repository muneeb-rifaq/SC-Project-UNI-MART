// ============================================================================
// Sidebar.jsx - Collapsible Navigation Menu
// ============================================================================

import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ items, activeItem, onItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
      >
        {isCollapsed ? '☰' : '✕'}
      </button>
      
      {!isCollapsed && (
        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onItemClick(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Sidebar;

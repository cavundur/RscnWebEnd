import React from "react";
import Icon from "./Icon";

export default function SocialMediaLinks({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <Icon name="linkedin-in" />
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <Icon name="x" />
      </a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <Icon name="youtube" />
      </a>
    </div>
  );
} 
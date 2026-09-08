"use client";
import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Type and press Enter",
  maxTags = 30,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "0.5rem",
        cursor: "text",
        minHeight: 44,
      }}
      onClick={() => {
        const el = document.getElementById("tag-input-field");
        el?.focus();
      }}
    >
      <div className="tag-list">
        {tags.map((tag) => (
          <span key={tag} className="tag-item">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(tag)}
              disabled={disabled}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            id="tag-input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(inputValue)}
            placeholder={tags.length === 0 ? placeholder : ""}
            disabled={disabled}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              minWidth: 120,
              flex: 1,
              fontFamily: "inherit",
              padding: "0.2rem 0.25rem",
            }}
          />
        )}
      </div>
    </div>
  );
}

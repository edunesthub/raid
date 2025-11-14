// src/components/UsernameInput.jsx
'use client';

import { useState, useEffect } from 'react';
import { usernameService } from '@/services/usernameService';
import { Check, X, Loader } from 'lucide-react';

export default function UsernameInput({ 
  value, 
  onChange, 
  excludeUserId = null,
  required = false,
  disabled = false 
}) {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [formatError, setFormatError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!value || value.length < 3) {
        setIsAvailable(null);
        setFormatError(null);
        setSuggestions([]);
        return;
      }

      // Validate format first
      const formatValidation = usernameService.validateUsernameFormat(value);
      setFormatError(formatValidation.error);

      if (!formatValidation.isValid) {
        setIsAvailable(null);
        return;
      }

      // Check availability
      setChecking(true);
      try {
        const available = await usernameService.isUsernameAvailable(value, excludeUserId);
        setIsAvailable(available);

        // Generate suggestions if taken
        if (!available) {
          const suggested = await usernameService.generateSuggestions(value);
          setSuggestions(suggested);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setIsAvailable(null);
      } finally {
        setChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [value, excludeUserId]);

  const getStatusIcon = () => {
    if (checking) {
      return <Loader className="w-5 h-5 text-gray-400 animate-spin" />;
    }
    if (isAvailable === true) {
      return <Check className="w-5 h-5 text-green-400" />;
    }
    if (isAvailable === false) {
      return <X className="w-5 h-5 text-red-400" />;
    }
    return null;
  };

  const getStatusMessage = () => {
    if (formatError) {
      return <p className="text-red-400 text-xs mt-1">{formatError}</p>;
    }
    if (checking) {
      return <p className="text-gray-400 text-xs mt-1">Checking availability...</p>;
    }
    if (isAvailable === true) {
      return <p className="text-green-400 text-xs mt-1">✓ Username is available</p>;
    }
    if (isAvailable === false) {
      return <p className="text-red-400 text-xs mt-1">✗ Username is already taken</p>;
    }
    return null;
  };

  const getBorderColor = () => {
    if (formatError || isAvailable === false) {
      return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    }
    if (isAvailable === true) {
      return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
    }
    return 'border-gray-700 focus:border-orange-500 focus:ring-orange-500/20';
  };

  return (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-2">
        Username {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Choose a unique username"
          className={`w-full bg-gray-800 border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${getBorderColor()} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          minLength={3}
          maxLength={20}
          required={required}
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {getStatusMessage()}

      {/* Username format requirements */}
      {value.length === 0 && (
        <div className="mt-2 text-xs text-gray-400">
          <p className="font-medium mb-1">Requirements:</p>
          <ul className="space-y-0.5">
            <li>• 3-20 characters</li>
            <li>• Letters, numbers, underscores, hyphens</li>
            <li>• Must start with letter or number</li>
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-sm font-medium mb-2">Try these available usernames:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(suggestion)}
                className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
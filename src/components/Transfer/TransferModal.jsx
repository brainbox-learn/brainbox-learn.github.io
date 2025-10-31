import React, { useState } from 'react';
import { Copy, Check, X, ArrowsClockwise, SignIn } from '@phosphor-icons/react';
import { useTransfer } from '../../hooks/useTransfer';

const TransferModal = ({ isOpen, onClose, profile, onProfileImported }) => {
  // If no profile provided, default to "enter" tab (import-only mode)
  const [activeTab, setActiveTab] = useState(profile ? 'generate' : 'enter');
  const [transferCode, setTransferCode] = useState(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { createTransferCode, redeemTransferCode, loading, error } = useTransfer();
  
  // Reset tab when modal opens/profile changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(profile ? 'generate' : 'enter');
    }
  }, [isOpen, profile]);
  
  if (!isOpen) return null;
  
  const handleGenerateCode = async () => {
    try {
      const result = await createTransferCode(profile);
      setTransferCode(result.code);
    } catch (err) {
      console.error('Failed to generate code:', err);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(transferCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleRedeem = async () => {
    try {
      const profileData = await redeemTransferCode(enteredCode);
      onProfileImported(profileData);
      setEnteredCode('');
      onClose();
    } catch (err) {
      console.error('Failed to redeem code:', err);
    }
  };
  
  const handleClose = () => {
    setTransferCode(null);
    setEnteredCode('');
    setCopied(false);
    onClose();
  };
  
  // Import-only mode (no profile selected)
  const isImportOnly = !profile;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {isImportOnly ? 'Import Profile' : 'Transfer Profile'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Tabs (only show if profile exists) */}
        {!isImportOnly && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'generate'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowsClockwise size={20} />
                <span>Generate Code</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('enter')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'enter'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <SignIn size={20} />
                <span>Enter Code</span>
              </div>
            </button>
          </div>
        )}
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'generate' && !isImportOnly ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Generate a one-time code to transfer <strong>{profile?.name}'s</strong> progress to another device.
              </p>
              
              {!transferCode ? (
                <button
                  onClick={handleGenerateCode}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Generating...' : 'Generate Transfer Code'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-4 border-blue-300">
                    <p className="text-sm text-gray-600 mb-3 font-semibold">Your Transfer Code:</p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-xl sm:text-2xl font-mono font-bold text-blue-700 break-all">
                        {transferCode}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                      ⏰ <strong>This code expires in 15 minutes</strong> and can only be used once.
                    </p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <p className="text-sm text-red-800">
                    ❌ <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                {isImportOnly 
                  ? 'Enter the transfer code from your other device to import a profile.'
                  : 'Enter a transfer code to import another profile to this device.'
                }
              </p>
              
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                placeholder="WOLF-MOON-BEAR-FYEG"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-mono uppercase focus:border-blue-500 focus:outline-none"
                maxLength={20}
              />
              
              <button
                onClick={handleRedeem}
                disabled={loading || !enteredCode.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Importing...' : 'Import Profile'}
              </button>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <p className="text-sm text-red-800">
                    ❌ <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
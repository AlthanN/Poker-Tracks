import { useState } from 'react';

export function SessionValidation({ 
  players, 
  totalBuyIn, 
  sessionDuration, 
  onBackToTable 
}) {
  const [finalChips, setFinalChips] = useState({});
  const [validationMessage, setValidationMessage] = useState('');

  // Format duration as HH:MM:SS
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateFinalChips = (playerId, amount) => {
    setFinalChips(prev => ({
      ...prev,
      [playerId]: amount
    }));
  };

  const calculateValidity = () => {
    // Check if all players have entered their final chip counts
    const allEntered = players.every(player => finalChips[player.id] !== undefined && finalChips[player.id] !== '');
    
    if (!allEntered) {
      setValidationMessage('Please enter final chip counts for all players');
      return;
    }

    // Calculate total final chips (rounded to 2 decimals)
    const totalFinalChipsRaw = players.reduce((sum, player) => {
      return sum + (parseFloat(finalChips[player.id]) || 0);
    }, 0);
    const totalFinalChips = Math.round(totalFinalChipsRaw * 100) / 100;
    const expectedTotal = Math.round(totalBuyIn * 100) / 100;

    if (totalFinalChips === expectedTotal) {
      setValidationMessage(`✓ Valid! Total matches: $${expectedTotal.toFixed(2)}`);
    } else {
      const difference = Math.round((totalFinalChips - expectedTotal) * 100) / 100;
      const sign = difference > 0 ? '+' : '';
      setValidationMessage(`✗ Invalid! Difference: ${sign}$${Math.abs(difference).toFixed(2)} (Expected: $${expectedTotal.toFixed(2)}, Got: $${totalFinalChips.toFixed(2)})`);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-start justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-4 sm:p-6 shadow-2xl mx-2">
        <h2 className="text-white text-xl sm:text-2xl mb-4 text-center">Session Ended</h2>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4">
          <div className="text-gray-400 text-xs sm:text-sm">Session Duration</div>
          <div className="text-white text-lg sm:text-xl font-bold">{formatDuration(sessionDuration)}</div>
          <div className="text-gray-400 text-xs sm:text-sm mt-2">Total Buy-in</div>
          <div className="text-yellow-400 text-lg sm:text-xl font-bold">${totalBuyIn.toFixed(2)}</div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-white mb-3 text-sm sm:text-base">Enter Final Chip Counts</h3>
          <div className="space-y-3">
            {players.map(player => (
              <div key={player.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
                <div className="flex-1">
                  <div className="text-white text-sm">{player.name}</div>
                  <div className="text-gray-400 text-xs">Buy-in: ${player.chips.toFixed(2)}</div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalChips[player.id] || ''}
                  onChange={(e) => updateFinalChips(player.id, e.target.value)}
                  className="bg-gray-800 text-white text-sm px-3 py-2 rounded w-full sm:w-32"
                  placeholder="Final $"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={calculateValidity}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg transition-colors mb-3 text-sm sm:text-base"
        >
          Calculate Validity
        </button>

        {validationMessage && (
          <div className={`p-3 rounded-lg text-center mb-3 text-sm sm:text-base ${
            validationMessage.startsWith('✓') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            {validationMessage}
          </div>
        )}

        <button
          onClick={onBackToTable}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg transition-colors text-sm sm:text-base"
        >
          Back to Table
        </button>
      </div>
    </div>
  );
}
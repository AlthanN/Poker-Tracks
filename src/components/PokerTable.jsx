import { useState, useEffect } from 'react';
import { SessionValidation } from './SessionValidation';

function PokerTable() {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', chips: 10, position: 0, isActive: true },
    { id: 2, name: 'Player 2', chips: 20, position: 3, isActive: false },
    { id: 3, name: 'You', chips: 15, position: 5, isActive: true },
    { id: 4, name: 'Player 4', chips: 20, position: 7, isActive: true },
  ]);

  const [communityCards] = useState(['?', '?', '?', '?', '?']);

  const [removeMode, setRemoveMode] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerBuyIn, setNewPlayerBuyIn] = useState('10.00');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingBuyIn, setEditingBuyIn] = useState('');

  // Session management
  const [sessionStatus, setSessionStatus] = useState('not-started'); // 'not-started', 'in-progress', 'ended'
  const [sessionDuration, setSessionDuration] = useState(0); // in seconds

  // Calculate total pot from all player buy-ins
  const pot = players.reduce((sum, player) => sum + player.chips, 0);

  // Stopwatch effect
  useEffect(() => {
    let interval;
    if (sessionStatus === 'in-progress') {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setSessionStatus('in-progress');
    setSessionDuration(0);
  };

  const stopSession = () => {
    setSessionStatus('ended');
  };

  const resetSession = () => {
    setSessionStatus('not-started');
    setSessionDuration(0);
  };

  const addPlayer = () => {
    if (players.length >= 10) return;
    
    // Find first available position
    const occupiedPositions = players.map(p => p.position);
    const availablePosition = Array.from({ length: 10 }, (_, i) => i)
      .find(pos => !occupiedPositions.includes(pos));
    
    if (availablePosition !== undefined) {
      const buyInValue = Math.round((parseFloat(newPlayerBuyIn) || 10) * 100) / 100;
      const newPlayer = {
        id: Math.max(0, ...players.map(p => p.id)) + 1,
        name: newPlayerName || `Player ${players.length + 1}`,
        chips: buyInValue,
        position: availablePosition,
        isActive: false,
      };
      setPlayers([...players, newPlayer]);
      setShowAddPlayer(false);
      setNewPlayerName('');
      setNewPlayerBuyIn('10.00');
    }
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
    setRemoveMode(false);
  };

  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
  };

  const startEditingPlayer = (player) => {
    if (!removeMode) {
      setEditingPlayerId(player.id);
      setEditingName(player.name);
      setEditingBuyIn(player.chips.toString());
    }
  };

  const savePlayerEdit = (playerId) => {
    setPlayers(players.map(p => 
      p.id === playerId 
        ? { ...p, name: editingName || p.name, chips: Math.round((parseFloat(editingBuyIn) || p.chips) * 100) / 100 }
        : p
    ));
    setEditingPlayerId(null);
    setEditingName('');
    setEditingBuyIn('');
  };

  const cancelEdit = () => {
    setEditingPlayerId(null);
    setEditingName('');
    setEditingBuyIn('');
  };

  const getPlayerPosition = (position) => {
    const angle = (position / 10) * 2 * Math.PI - Math.PI / 2;
    // Responsive radii based on screen size
    const radiusX = window.innerWidth < 640 ? 38 : 42;
    const radiusY = window.innerWidth < 640 ? 32 : 38;
    
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // If session ended, show validation screen
  if (sessionStatus === 'ended') {
    return (
      <SessionValidation 
        players={players}
        totalBuyIn={pot}
        sessionDuration={sessionDuration}
        onBackToTable={resetSession}
      />
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-2 sm:p-4 overflow-hidden">
      {/* Add Player Modal Overlay */}
      {showAddPlayer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 rounded-lg px-4 py-4 shadow-xl border-2 border-blue-500 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-lg font-semibold">Add New Player</h3>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setNewPlayerName('');
                  setNewPlayerBuyIn('10');
                }}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="bg-gray-800 text-white text-sm px-3 py-3 rounded mb-3 w-full"
              placeholder="Player Name"
              autoFocus
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={newPlayerBuyIn}
              onChange={(e) => setNewPlayerBuyIn(e.target.value)}
              className="bg-gray-800 text-white text-sm px-3 py-3 rounded mb-3 w-full"
              placeholder="Buy-in Amount"
            />
            <div className="flex gap-3">
              <button
                onClick={addPlayer}
                disabled={players.length >= 10}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex-1 text-sm font-medium"
              >
                Add Player
              </button>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setNewPlayerName('');
                  setNewPlayerBuyIn('10');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Always stays in same position */}
      <div className="w-full flex flex-col items-center justify-center">
        {/* Mobile Header - Stack controls vertically on small screens */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-2 sm:mb-0 p-2">
          {/* Session Controls */}
          <div className="flex gap-2 mb-2 sm:mb-0 w-full sm:w-auto justify-center">
            <button
              onClick={startSession}
              disabled={sessionStatus !== 'not-started' || showAddPlayer}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg shadow-lg transition-colors flex-1 sm:flex-none"
            >
              Start
            </button>
            <button
              onClick={stopSession}
              disabled={sessionStatus !== 'in-progress' || showAddPlayer}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg shadow-lg transition-colors flex-1 sm:flex-none"
            >
              Stop
            </button>
            <button
              onClick={resetSession}
              disabled={sessionStatus === 'not-started' || showAddPlayer}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg shadow-lg transition-colors flex-1 sm:flex-none"
            >
              Reset
            </button>
          </div>

          {/* Session Duration */}
          <div className="bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg w-full sm:w-auto text-center">
            <div className="text-[10px] sm:text-xs opacity-80">Session Duration</div>
            <div className="font-bold text-sm sm:text-base">{formatDuration(sessionDuration)}</div>
          </div>
        </div>

        {/* Poker Table */}
        <div className="relative w-full" style={{ aspectRatio: '16 / 9', maxHeight: 'calc(100vh - 180px)', height: 'auto' }}>
          {/* Table Surface - elongated oval */}
          <div className="absolute inset-0 bg-green-700 rounded-[50%] border-4 sm:border-8 border-amber-900 shadow-2xl">
            {/* Inner felt */}
            <div className="absolute inset-2 sm:inset-4 bg-green-600 rounded-[50%] border-2 sm:border-4 border-green-800"></div>
          </div>

          {/* Community Cards Area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
              {communityCards.map((card, index) => (
                <div
                  key={index}
                  className="w-6 h-8 sm:w-8 sm:h-12 bg-white rounded shadow-lg flex items-center justify-center border border-gray-300"
                >
                  <span className="text-[8px] sm:text-xs">{card}</span>
                </div>
              ))}
            </div>
            {/* Pot */}
            <div className="bg-amber-500 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-center shadow-lg">
              <div className="text-[8px] sm:text-[10px] opacity-80">TOTAL BUY-IN</div>
              <div className="font-bold text-sm sm:text-base">${pot.toFixed(2)}</div>
            </div>
          </div>

          {/* Players */}
          {players.map((player) => (
            <div key={player.id} className="absolute" style={getPlayerPosition(player.position)}>
              {editingPlayerId === player.id ? (
                // Edit Mode
                <div className="bg-gray-900 rounded-lg px-2 py-1 sm:px-3 sm:py-2 min-w-[90px] sm:min-w-[120px] shadow-xl border-2 border-blue-500">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full bg-gray-800 text-white text-[10px] sm:text-xs px-1 py-0.5 sm:py-1 rounded mb-1 sm:mb-2"
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingBuyIn}
                    onChange={(e) => setEditingBuyIn(e.target.value)}
                    className="w-full bg-gray-800 text-white text-[10px] sm:text-xs px-1 py-0.5 sm:py-1 rounded mb-1 sm:mb-2"
                    placeholder="Buy-in"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => savePlayerEdit(player.id)}
                      className="bg-green-600 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded flex-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div
                  onClick={() => (removeMode && !showAddPlayer) ? removePlayer(player.id) : (!showAddPlayer && !removeMode) ? startEditingPlayer(player) : null}
                  className={`bg-gray-900 rounded-lg px-2 py-1 sm:px-3 sm:py-2 min-w-[80px] sm:min-w-[100px] shadow-xl border-2 cursor-pointer ${
                    player.isActive ? 'border-yellow-400' : 'border-gray-700'
                  } ${removeMode && !showAddPlayer ? 'hover:border-red-500 hover:bg-red-900 transition-colors' : (!showAddPlayer && !removeMode) ? 'hover:border-blue-500 transition-colors' : 'cursor-default'}`}
                >
                  {removeMode && !showAddPlayer && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      ✕
                    </div>
                  )}
                  {!removeMode && !showAddPlayer && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-blue-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      ✎
                    </div>
                  )}
                  <div className="text-white text-xs truncate mb-0.5 sm:mb-1">{player.name}</div>
                  <div className="flex items-center gap-1">
                    {/* Chip icon */}
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 border border-white"></div>
                    <span className="text-yellow-400 text-xs font-bold">${player.chips.toFixed(2)}</span>
                  </div>
                  {/* Player cards */}
                  <div className="flex gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                    <div className="w-4 h-6 sm:w-6 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded shadow border border-blue-900"></div>
                    <div className="w-4 h-6 sm:w-6 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded shadow border border-blue-900"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Player Controls */}
        <div className="w-full mt-2 m:mt-4 px-2">
          {!showAddPlayer && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                onClick={() => setShowAddPlayer(true)}
                disabled={players.length >= 10 || removeMode}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 sm:px-8 py-3 rounded-lg shadow-lg transition-colors text-sm sm:text-base"
              >
                Add Player ({players.length}/10)
              </button>

              <button 
                onClick={toggleRemoveMode}
                disabled={players.length === 0 || showAddPlayer}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 sm:px-8 py-3 rounded-lg shadow-lg transition-colors text-sm sm:text-base"
              >
                {removeMode ? 'Cancel' : 'Remove Player'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PokerTable;
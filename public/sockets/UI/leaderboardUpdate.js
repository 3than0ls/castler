export const leaderboardUpdate = (socket, leaderboard) => {
    socket.on('leaderboardUpdate', leaderboardState => {
        if (leaderboardState) { // if the leaderboardState is missing, don't update client leaderboard
            leaderboard.length = 0; // clear the leaderboard
            for (let i = 0; i < leaderboardState.length; i++) {
                leaderboard.push(leaderboardState[i]); // repopulate the leaderboard with server sent values
            }
        }
    });
};

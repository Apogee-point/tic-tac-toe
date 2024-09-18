import { useEffect, useState } from "react";
import PropTypes from 'prop-types';

const Board = ({ result, setResult, socket }) => {
   const [boardState, setBoardState] = useState(["", "", "", "", "", "", "", "", ""]);
   const [player, setPlayer] = useState("X");
   const [turn, setTurn] = useState("X");

   // eslint-disable-next-line react-hooks/exhaustive-deps
   const checkWin = () => {
      const winStates = [
         [0, 1, 2],
         [3, 4, 5],
         [6, 7, 8],
         [0, 3, 6],
         [1, 4, 7],
         [2, 5, 8],
         [0, 4, 8],
         [2, 4, 6],
      ];
      for (let i = 0; i < winStates.length; i++) {
         const [a, b, c] = winStates[i];
         if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
         }
      }
      return null;
   };

   // eslint-disable-next-line react-hooks/exhaustive-deps
   const checkTie = () => boardState.every((cell) => cell !== "");

   const handleClick = (index) => {
      if (boardState[index] === "" && player === turn) {
         const newBoard = [...boardState];
         newBoard[index] = player;
         setBoardState(newBoard);
         setTurn(turn === "X" ? "O" : "X");
         // setPlayer(player === "X" ? "O" : "X");
         socket.emit("move", { index, player});
         console.log("You moved", index, player);
      }
   };

   useEffect(() => {
      // Set up socket event listeners
      socket.on("move", ({ index, player }) => {
         const newBoard = [...boardState];
         console.log("Other player moved", index, player);
         newBoard[index] = player;
         setBoardState(newBoard);
         setTurn(turn === "X" ? "O" : "X");
         setPlayer(player === "X" ? "O" : "X");
      });

      socket.on("win", (player) => {
         setResult({ winner: player, state: "win" });
      });

      socket.on("tie", () => {
         setResult({ winner: "none", state: "tie" });
      });

      return () => {
         // Clean up listeners when the component unmounts
         socket.off("move");
         socket.off("win");
         socket.off("tie");
      };
   }, [boardState, socket, turn, setResult]);

   useEffect(() => {
      const winner = checkWin();
      if (winner) {
         setResult({ winner, state: "win" });
         socket.emit("win", winner);
         setBoardState(["", "", "", "", "", "", "", "", ""]);
      }
      if (checkTie()) {
         setResult({ winner: "none", state: "tie" });
         socket.emit("tie");
      }
   }, [boardState, checkWin, checkTie, setResult, socket]);

   return (
      <div className="board">
         {boardState.map((cell, index) => (
            <div key={index} className="cell" onClick={() => handleClick(index)}>
               {cell}
            </div>
         ))}
         {result && (
            <div className="result">
               Result: {result.state === "win" ? `Winner is ${result.winner}` : "It's a tie!"}
            </div>
         )}
      </div>
   );
};

Board.propTypes = {
   result: PropTypes.object.isRequired,
   setResult: PropTypes.func.isRequired,
   socket: PropTypes.shape({
      on: PropTypes.func.isRequired,
      emit: PropTypes.func.isRequired,
      off: PropTypes.func.isRequired,
   }).isRequired,
};

export default Board;

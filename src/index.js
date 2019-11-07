import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { check_status, update_table } from "./array_manipulation";

// Set initial board size
const INITIAL_SIZE = 5;
// Should the board be expanding or not
const EXPANDING = true;
// Maximum time player should have
const MAX_TIME = 10;
// Update time speed
const UPDATE_SPEED = 16;

// class Square extends React.Component {
function Square(props) {
    return (
        <button
            className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(x, y) {
        return (
            <Square value={this.props.squares[x][y]} key={[x, y]}
                onClick={() => this.props.onClick(x, y)}
            />
        );
    }

    renderColumns(y) {
        let columns = [];
        for (let x = 0; x < this.props.squares.length; x++) {
            columns.push(this.renderSquare(x, y));
        }
        return (
            <div className="board-row" key={y}>
                {columns}
            </div>
        )
    }

    renderRows() {
        let rows = [];
        for (let y = 0; y < this.props.squares[0].length; y++) {
            rows.push(this.renderColumns(y));
        }
        return (
            <div>
                {rows}
            </div>
        )
    }

    render() {
        return (
            this.renderRows()
        );
    }
}

class Countdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timerEnabled: false,
            intervalHandle: null,
        }
    }

    componentDidMount() {
        if (this.state.timerEnabled === true) {
            let newIntervalHandle = setInterval(() => {
                this.update_time();
            }, UPDATE_SPEED);
            this.setState({ intervalHandle: newIntervalHandle });
        }
    }

    update_time() {
        if (this.props.gameOver === true) {
            this.handleTimer();
        }
        let new_time = this.props.time;
        new_time -= UPDATE_SPEED / 1000;
        if (new_time > 0) {
            this.props.onNewTime(new_time);
        } else {
            this.props.onTimeUp();
        }
    }

    handleTimer() {
        let newIntervalHandle;
        let enabled;
        if (this.state.timerEnabled === true || this.props.gameOver === true) {
            clearInterval(this.state.intervalHandle);
            enabled = false;
        } else {
            newIntervalHandle = setInterval(() => {
                this.update_time();
            }, UPDATE_SPEED);
            enabled = true;
        }
        this.setState({
            timerEnabled: enabled,
            intervalHandle: newIntervalHandle,
        });
    }

    render() {
        const time = this.props.time;
        const percent = (time / MAX_TIME);
        const color = "rgba(" + String(255 - percent * 255) + "," + String(percent * 255) + ",0,0.6)";
        // https://facebook.github.io/react-native/docs/height-and-width
        return (
            <div className="timer-container">
                <div className="timer-base">
                    <div style={{ width: percent * 100 + "%", backgroundColor: color }} className="timer-bar"></div>
                    <div className="timer-bar">{Math.ceil(time)}</div>
                </div>
                <button
                    className="restart" style={{ width: 300 }} onClick={() => this.handleTimer()}>
                    {this.state.timerEnabled ? "Stop timer" : "Start timer"}
                </button>
            </div>)
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        let squares = new Array(INITIAL_SIZE);
        for (let x = 0; x < INITIAL_SIZE; x++) {
            squares[x] = Array(INITIAL_SIZE).fill(null);
        }
        this.state = {
            history: [{
                squares: squares,
            }],
            gameOver: false,
            stepNumber: 0,
            xIsNext: true,
            time: MAX_TIME,
        };
    }

    handleHistory(history) {
        const current = history[history.length - 1];
        // Copy old array to history
        let squares = new Array(current.squares.length);
        for (let level = 0; level < squares.length; level++) {
            squares[level] = current.squares[level].slice();
        }
        return squares;
    }

    handleClick(x, y) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        // Exit imidiately if GameOver is true
        if (this.state.gameOver === true) {
            return;
        }
        let squares = this.handleHistory(history);
        // Set new value
        if (squares[x][y] === null) {
            squares[x][y] = this.state.xIsNext ? 'X' : 'O';
        } else {
            return;
        }
        // Check do we have a winner
        let gameOver = check_status(squares, x, y);
        if (gameOver === true && this.state.xIsNext === true) {
            alert("Player 1 won!");
        } else if (gameOver === true && this.state.xIsNext === false) {
            alert("Player 2 won!");
        }
        // Update board size if needed
        if (EXPANDING === true) {
            squares = update_table(squares, x, y);
        }
        // Set new states
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            gameOver: gameOver,
            xIsNext: !this.state.xIsNext,
            time: MAX_TIME,
        });
    }

    Undo() {
        // Undo previous move
        let newStepNumber;
        if (this.state.stepNumber === 0) {
            newStepNumber = 0;
        } else {
            newStepNumber = this.state.stepNumber - 1;
        }
        this.setState({
            stepNumber: newStepNumber,
            gameOver: false,
            xIsNext: !this.state.xIsNext,
            time: MAX_TIME,
        });
    }

    reset() {
        this.setState({
            stepNumber: 0,
            gameOver: false,
            xIsNext: true,
            time: MAX_TIME,
        });
    }

    timeUp() {
        this.setState({
            xIsNext: !this.state.xIsNext,
            time: MAX_TIME,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        let status;
        if (this.state.gameOver === true) {
            status = 'Winner is: ' + (!this.state.xIsNext ? 'X' : 'O');
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div>
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(x, y) => this.handleClick(x, y)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                </div>
                <br></br>
                <Countdown
                    time={this.state.time}
                    gameOver={this.state.gameOver}
                    onTimeUp={() => this.timeUp()}
                    onNewTime={(new_time) => this.setState({ time: new_time })}
                />
                <div>
                    <button
                        className="restart" onClick={() => this.reset()}>
                        Restart
                    </button>
                    <button
                        className="restart" onClick={() => this.Undo()} >
                        Undo
                    </button>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
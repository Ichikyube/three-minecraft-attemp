/**
 * Singleton for managing game states
 */
CANNONS.gameStates = new enums.Enum('splash', 'startGame', 'turnStart', 'decision', 'move', 'shoot', 'turnEnd', 'aiTurn', 'lose', 'win', 'gameOver', 'debug');
CANNONS.stateManager = {
    currentState : 0,
    stateSplash : function() {
    	controls.disable();
    	gui.showSplashScreen();
    },
    stateStartGame : function() {
        // is this needed?
        this.currentState = CANNONS.gameStates.turnStart;
        this.stateTurnStart();
    },
    stateTurnStart : function() {
        gui.turnTransition('It is your turn');
    },
    stateDecision : function() {
        gui.showTurnButtons();
    },
    stateMove : function() {
        gui.hideTurnButtons();
        player.moveMode();
        gui.lockPointer();
        gui.showTankControls();
        //gui.useTankControls();
        controls.enable();
        // display move counter
        var moveClock = new THREE.Clock(false);
        moveClock.start();
        gui.setMoveClock(moveClock.getElapsedTime());
        var int = setInterval(function() {
            gui.setMoveClock(moveClock.getElapsedTime());
        }, 1000);
        setTimeout(function() {
            CANNONS.stateManager.changeState(CANNONS.gameStates.turnEnd);
            moveClock.stop();
            gui.hideMoveClock();
            clearInterval(int);
        }, 30000);
    },
    stateShoot : function() {
        gui.hideTurnButtons();
        player.shootMode();
        gui.lockPointer();
        gui.showTankControls();
        gui.useTankControls();
        controls.enable();
    },
    stateTurnEnd : function() {
        gui.turnTransition('Your turn is over');
    },
    stateAiTurn : function() {
    	CANNONS.aitank.takeTurn();
    },
    stateLose : function() {
    	gui.turnTransition('You lost!');
    	CANNONS.stateManager.changeState(CANNONS.gameStates.gameOver);
    },
    stateWin : function() {
    	gui.turnTransition('You won!');
    	CANNONS.stateManager.changeState(CANNONS.gameStates.gameOver);
    },
    endGame : function() {
    	location.reload();
    },
    changeState : function(state) {
        console.log('changeState: ' + this.currentState + ' to ' + state);
        controls.disable();
    	this.currentState = state;
    	if (this.currentState == CANNONS.gameStates.splash)
    		this.stateSplash();
        if (this.currentState == CANNONS.gameStates.startGame)
            this.stateStartGame();
        else if (this.currentState == CANNONS.gameStates.turnStart)
            this.stateTurnStart();
    	else if (this.currentState == CANNONS.gameStates.decision)
            this.stateDecision();
    	else if (this.currentState == CANNONS.gameStates.move)
        	this.stateMove();
    	else if (this.currentState == CANNONS.gameStates.shoot)
        	this.stateShoot();
    	else if (this.currentState == CANNONS.gameStates.turnEnd)
        	this.stateTurnEnd();
        else if (this.currentState == CANNONS.gameStates.aiTurn)
            this.stateAiTurn();
        else if (this.currentState == CANNONS.gameStates.lose)
            this.stateLose();
        else if (this.currentState == CANNONS.gameStates.win)
            this.stateWin();
        else if (this.currentState == CANNONS.gameStates.gameOver)
            this.endGame();
        else if (this.currentState == CANNONS.gameStates.debug)
            this.stateDebug();
    },
    nextState : function() {
        console.log('nextState - currentState: ' + this.currentState);

        // show the splash screen
        if (this.currentState == CANNONS.gameStates.splash)
            this.changeState(CANNONS.gameStates.startGame);
        else if (this.currentState == CANNONS.gameStates.turnStart)
            this.changeState(CANNONS.gameStates.decision);
        else if (this.currentState == CANNONS.gameStates.move)
            this.changeState(CANNONS.gameStates.turnEnd);
        else if (this.currentState == CANNONS.gameStates.shoot)
            this.changeState(CANNONS.gameStates.turnEnd);
        else if (this.currentState == CANNONS.gameStates.turnEnd)
            setTimeout(function() { CANNONS.stateManager.changeState(CANNONS.gameStates.aiTurn); }, 5000);
        else if (this.currentState == CANNONS.gameStates.aiTurn)
            this.changeState(CANNONS.gameStates.turnStart);
    },
    // used for development
    stateDebug: function() {
        gui.debugPointerLock();
        gui.showFirstPersonControls();
        controls.enable();
    }
};
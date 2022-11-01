export const mvControl = {
  pressBackward: false,
  pressForward: false,
  pressLeft: false,
  pressRight: false,
  pressJump: false
}
const KEYS = {
  'a': 65,
  's': 83,
  'w': 87,
  'd': 68,
};

export var onKeyDown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      mvControl.pressForward = true;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      mvControl.pressLeft = true;
      break;

    case 'ArrowDown':
    case 'KeyS':
      mvControl.pressBackward = true;
      break;

    case 'ArrowRight':
    case 'KeyD':
      mvControl.pressRight = true;
      break;

    case 'Space':
      mvControl.pressJump = true;
      break;

    case 'KeyQ':
      viewControl.GunView = -mvControl.GunView;
      break;

    case '3':viewControl
      camera.position.set(0, 50, 250);
      break;

    case '1':
      camera.position.set(0, 35, 10);
      break;

    case 'R':
      camera.rotateX(rotateAngle);
      break;

    case '1':
      camera.rotateX(-rotateAngle);
      break;

    case 'R' + 'F':
      camera.rotateX(-6 * camera.rotation.x * rotateAngle);
  }
}
 // limit camera to +/- 45 degrees (0.7071 radians) or +/- 60 degrees (1.04 radians)
 camera.rotation.x = THREE.Math.clamp( camera.rotation.x, -1.04, 1.04 );
export var onKeyUp = function (event) {
  switch (event.code) {

    case 'ArrowUp':
    case 'KeyW':
      mvControl.pressForward = false;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      mvControl.pressLeft = false;
      break;

    case 'ArrowDown':
    case 'KeyS':
      mvControl.pressBackward = false;
      break;

    case 'ArrowRight':
    case 'KeyD':
      mvControl.pressRight = false;
      break;

    case 'Space':
      mvControl.pressJump = false;
      break;
  }
}


class InputController {
  constructor(target) {
    this.target_ = target || document;
    this.initialize_();
  }

  initialize_() {
    this.current_ = {
      leftButton: false,
      rightButton: false,
      mouseXDelta: 0,
      mouseYDelta: 0,
      mouseX: 0,
      mouseY: 0,
    };
    this.previous_ = null;
    this.keys_ = {};
    this.previousKeys_ = {};
    this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
    this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
    this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
    this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
    this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
  }

  onMouseMove_(e) {
    this.current_.mouseX = e.pageX - window.innerWidth / 2;
    this.current_.mouseY = e.pageY - window.innerHeight / 2;

    if (this.previous_ === null) {
      this.previous_ = {
        ...this.current_
      };
    }

    this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
    this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
  }

  onMouseDown_(e) {
    this.onMouseMove_(e);

    switch (e.button) {
      case 0: {
        this.current_.leftButton = true;
        break;
      }
      case 2: {
        this.current_.rightButton = true;
        break;
      }
    }
  }

  onMouseUp_(e) {
    this.onMouseMove_(e);

    switch (e.button) {
      case 0: {
        this.current_.leftButton = false;
        break;
      }
      case 2: {
        this.current_.rightButton = false;
        break;
      }
    }
  }

  onKeyDown_(e) {
    this.keys_[e.keyCode] = true;
  }

  onKeyUp_(e) {
    this.keys_[e.keyCode] = false;
  }

  key(keyCode) {
    return !!this.keys_[keyCode];
  }

  isReady() {
    return this.previous_ !== null;
  }

  update(_) {
    if (this.previous_ !== null) {
      this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
      this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

      this.previous_ = {
        ...this.current_
      };
    }
  }
};
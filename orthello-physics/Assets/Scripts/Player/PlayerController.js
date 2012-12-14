private var _player : Player;
private var _horizontal : float = 0.0;
private var _lastVelocity : Vector2 = Vector2(0.0, 0.0);

private var _colliderBoundsOffsetX : float;
private var _colliderBoundsOffsetY : float;
private var _skinThickness : float = 0.01;

// called once in the lifetime of the script
function Awake() {
	_player = this.GetComponent(Player);
	_colliderBoundsOffsetX = _player.rigidbody.collider.bounds.extents.x;
	_colliderBoundsOffsetY = _player.rigidbody.collider.bounds.extents.y;
}

// Use this for initialization
function Start() {
}

/*
Detect user input.
Called once per frame.
*/
function Update() {
	// Get the user input
	_horizontal = Input.GetAxis("Horizontal"); // -1.0 to 1.0

	if (Input.GetButtonDown("Jump")) {
		// this will do nothing if the player is already jumping
		_player.OnJump();
	}
}

/*
Update player position.
Called at fix intervals.
*/
function FixedUpdate() {
	// horizontal direction has changed, undo last velocity applied
	_player.AddVelocity(Vector2(_lastVelocity.x * -1, 0));

	// apply velocity in new direction
	_player.AddVelocity(Vector2(Player.WALK_SPEED * _horizontal, 0));

	//TODO: Use OnWalk and OnStop instead
	var absHorizontalVelocity = Mathf.Abs(_player.GetVelocity().x);
	_player.SetIsWalking(!_player.IsJumping() && absHorizontalVelocity > 0.1 && absHorizontalVelocity >= Mathf.Abs(_lastVelocity.x));

	if (_horizontal > 0) {
		_player.FaceRight();
	} else if (_horizontal < 0) {
		_player.FaceLeft();
	}
	
	// adjust velocity based on collisions (if any)
	var dt : float = Time.deltaTime;
	_player.SetVelocity(CollisionCheck(dt));

	// move the player
	var v : Vector2 = _player.GetVelocity();
	var sprite : OTAnimatingSprite = _player.GetSprite();
	sprite.position.x += v.x * dt;
	sprite.position.y += v.y * dt;
	
	_lastVelocity = v;
}

/*
Determines if the player will collide with something at their current
velocity.  If so, will return a new vector to apply instead that will
prevent collisions.
*/
function CollisionCheck(deltaTime : float) : Vector2 {
	
	// TODO: Seperate checks for head and feet
	var playerVelocity : Vector2 = _player.GetVelocity();
	if (playerVelocity.magnitude == 0) {
		// player is not moving
		return playerVelocity;
	}
	
	// horizontal ray
	var origin : Vector3 = _player.rigidbody.position;
	var rayOffsetY = Vector3(0, _colliderBoundsOffsetY - _skinThickness, 0);
	var direction : Vector3 = Vector3(playerVelocity.x, 0, 0).normalized;
	var distance : float = playerVelocity.x * deltaTime;
	var absoluteDistance : float = Mathf.Abs(distance) + _colliderBoundsOffsetX + _skinThickness;

	Debug.DrawLine(origin + rayOffsetY, Vector3(origin.x + absoluteDistance, origin.y, origin.z) + rayOffsetY, Color.green, 0);
	Debug.DrawLine(origin, Vector3(origin.x + absoluteDistance, origin.y, origin.z), Color.green, 0);
	Debug.DrawLine(origin - rayOffsetY, Vector3(origin.x + absoluteDistance, origin.y, origin.z) - rayOffsetY, Color.green, 0);

	var hitInfo : RaycastHit;
	if (Physics.Raycast(origin + rayOffsetY, direction, hitInfo, absoluteDistance) ||
		Physics.Raycast(origin - rayOffsetY, direction, hitInfo, absoluteDistance) ||
		Physics.Raycast(origin, direction, hitInfo, absoluteDistance)) {
		// adjust horizontal velocity to prevent collision
		playerVelocity.x = 0;

		if (direction == Vector3.right) {
			_player.GetSprite().position.x += hitInfo.distance - _colliderBoundsOffsetX;
		} else {
			_player.GetSprite().position.x -= hitInfo.distance - _colliderBoundsOffsetX;
		}
	}
	
	// veritcal rays
	origin = _player.rigidbody.position;
	var rayOffsetX = Vector3(_colliderBoundsOffsetX - _skinThickness, 0, 0);
	direction = Vector3(0, playerVelocity.y, 0).normalized;
	distance = playerVelocity.y * deltaTime;
	absoluteDistance = Mathf.Abs(distance) + _colliderBoundsOffsetY + _skinThickness;

	Debug.DrawLine(origin + rayOffsetX, Vector3(origin.x, origin.y + absoluteDistance, origin.z) + rayOffsetX, Color.magenta, 0);
	Debug.DrawLine(origin, Vector3(origin.x, origin.y + absoluteDistance, origin.z), Color.magenta, 0);
	Debug.DrawLine(origin - rayOffsetX, Vector3(origin.x, origin.y + absoluteDistance, origin.z) - rayOffsetX, Color.magenta, 0);
	
	if (Physics.Raycast(origin + rayOffsetX, direction, hitInfo, absoluteDistance) ||
		Physics.Raycast(origin - rayOffsetX, direction, hitInfo, absoluteDistance) ||
		Physics.Raycast(origin, direction, hitInfo, absoluteDistance)) {
		// adjust vertical velocity to prevent collision
		playerVelocity.y = 0;

		if (direction == Vector3.up) {
			// bumped our head
			_player.GetSprite().position.y += hitInfo.distance - _colliderBoundsOffsetY;
		} else {
			// hit the gound
			_player.OnLand();
			_player.GetSprite().position.y -= hitInfo.distance - _colliderBoundsOffsetY;
		}
	} else {
		_player.NotOnLand();
	}
	
	return playerVelocity;
}

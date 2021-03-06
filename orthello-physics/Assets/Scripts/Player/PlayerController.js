// Physics Script from: http://wiki.unity3d.com/index.php?title=PhysicsFPSWalker
// These variables are for adjusting in the inspector how the object behaves
var maxSpeed : float = 20.0;
var force : float = 60.0;
var jumpSpeed : float = 10.5;
 
// These variables are there for use by the script and don't need to be edited
private var state = 1;
private var grounded = false;
private var jumpLimit = 0;


private var player : Player;

// Use this for initialization
function Start() {
	player = GetComponent(Player);
	// The line above is equivalent to: player = GameObject.Find('Player').GetComponent(Player);
	// However, since this script (PlayerController) is added as a component to the 'Player' Prefab instance
	// in the unity editor, the GameObject.Find('Player') bit is unnecessary. We're already in the GameObject.
}

// This part detects whether or not the object is grounded and stores it in a variable
function OnCollisionEnter() {
	if (player.usePhysics) {
		state++;
		if(state > 0) {
			grounded = true;
		}
	}
}

function OnCollisionExit() {
	if (player.usePhysics) {
		state--;
		if(state < 1) {
			grounded = false;
			state = 0;
		}
	}
}

function FixedUpdate() {
	if (player.usePhysics) {
		// Get the input and set variables for it
		var jump = Input.GetButtonDown("Jump");
		var horizontal = Input.GetAxis("Horizontal");
		var vertical = Input.GetAxis("Vertical");
	
		// Set the movement input to be the force to apply to the player every frame
		horizontal *= force;
		vertical *= force;
	
		// If the object is grounded and isn't moving at the max speed or higher apply force to move it
		if(rigidbody.velocity.magnitude < maxSpeed && grounded == true) {
			rigidbody.AddForce(transform.rotation * Vector3.forward * vertical);
			rigidbody.AddForce(transform.rotation * Vector3.right * horizontal);
		}
	
		// This part is for jumping. I only let jump force be applied every 10 physics frames so
		// the player can't somehow get a huge velocity due to multiple jumps in a very short time
		if(jumpLimit < 10) jumpLimit ++;
	
		if(jump && jumpLimit >= 10 && grounded == true)
		{
			rigidbody.velocity.y += jumpSpeed;
			jumpLimit = 0;
		}
	} else {
		player.isMoving = false;

		// keyboard input
		if (Input.GetKey(KeyCode.LeftArrow)) {
			player.MoveLeft();
		}
	
		if (Input.GetKey(KeyCode.RightArrow)) {
			player.MoveRight();
		}
	
		if (Input.GetKey(KeyCode.Space)) {
			if (player.isGrounded) {
				player.Jump();
			}
		}
	}
}

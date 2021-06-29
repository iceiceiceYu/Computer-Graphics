// camera parameters
const camera = {
    fov: CameraPara.fov,
    near: CameraPara.near,
    far: CameraPara.far,
    eye: CameraPara.eye,
    at: CameraPara.at,
    up: CameraPara.up,
    aspect: 1
};

/**
 * move and rotate camera through updating camera parameters
 * @param camera: global dict holds the camera parameters
 * @param elapsed: time elapsed
 * @param key_pressing: key pressed
 */
function moveAndRotateCamera(camera, elapsed, key_pressing) {
    let view_direction = VectorNormalize(VectorMinus(new Vector3(camera.at), new Vector3(camera.eye)));
    let right_direction = VectorNormalize(VectorCross(view_direction, new Vector3(camera.up)));

    // compute rotate_axis to rotate camera
    const rotate_step = ROT_VELOCITY * elapsed;
    let rotate_axis = new Vector3();

    // key press controller for rotating
    if (key_pressing.i) {
        rotate_axis = VectorAdd(rotate_axis, right_direction);
    } else if (key_pressing.k) {
        rotate_axis = VectorMinus(rotate_axis, right_direction);
    }
    if (key_pressing.j) {
        rotate_axis = VectorAdd(rotate_axis, new Vector3(camera.up));
    } else if (key_pressing.l) {
        rotate_axis = VectorMinus(rotate_axis, new Vector3(camera.up));
    }

    // rotate camera according pressing
    rotateCamera(rotate_step, rotate_axis);

    // compute move_vector to move camera
    const move_step = MOVE_VELOCITY * elapsed;
    let move_vector = new Vector3();

    // key press controller for moving
    if (key_pressing.w) {
        move_vector = VectorAdd(move_vector, view_direction);
    } else if (key_pressing.s) {
        move_vector = VectorMinus(move_vector, view_direction);
    }
    if (key_pressing.d) {
        move_vector = VectorAdd(move_vector, right_direction);
    } else if (key_pressing.a) {
        move_vector = VectorMinus(move_vector, right_direction);
    }

    // normalize move vector and multiply move step to get move vector
    move_vector = VectorMultNum(VectorNormalize(move_vector), move_step);

    // update camera parameters
    camera.eye = VectorAdd(move_vector, new Vector3(camera.eye)).elements;
    camera.at = VectorAdd(move_vector, new Vector3(camera.at)).elements;
}

/**
 * rotate camera through updating camera parameters
 * @param rotate_step: rotate step
 * @param rotate_axis: rotate axis
 */
function rotateCamera(rotate_step, rotate_axis) {
    if (rotate_step !== 0 && (rotate_axis.elements[0] !== 0 || rotate_axis.elements[1] !== 0 || rotate_axis.elements[2] !== 0)) {
        const rotate_matrix = new Matrix4().setRotate(rotate_step, ...rotate_axis.elements);
        let eye_vector = new Vector3(camera.eye);
        let at_vector = new Vector3(camera.at);
        let up_vector = new Vector3(camera.up);

        // get view direction before
        let view_direction = VectorMinus(at_vector, eye_vector);
        // calculate new view direction after rotate
        view_direction = rotate_matrix.multiplyVector3(view_direction);
        // calculate new up vector after rotate
        up_vector = rotate_matrix.multiplyVector3(up_vector);
        // get new at vector from new view direction
        at_vector = VectorAdd(eye_vector, view_direction);

        // update camera parameters
        camera.at = at_vector.elements;
        camera.up = up_vector.elements;
    }
}

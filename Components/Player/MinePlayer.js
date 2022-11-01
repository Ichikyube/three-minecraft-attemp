

const GRAVITY = 30;
var walk_speed = 8.0; //var run_speed = 16.0;
var jump_speed = 95.0;





// Not falling through a block or above a block (above collision)
for (var i = 0; i < chunks.length; i++) {
    for (var j = 0; j < chunks[i].length; j++) {
        var b = chunks[i][j];
        var c = intersect(b.x, b.y + 10, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h,
            player.d);
        if (c && camera.position.y <= chunks[i][j].y + 2.5 + player.h && camera.position.y >= chunks[i][
                j
            ].y && b.blockType != "water") {
            camera.position.y = chunks[i][j].y + 2.5 + player.h;
            ySpeed = 0;
            canJump = true;
        }
        var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h,
            player.d); // this one doesn't have a + 10 in the b.y
        if (c && camera.position.y >= chunks[i][j].y - 2.5 && camera.position.y <= chunks[i][j].y && b
            .blockType != "water") {
            ySpeed = 0.5;
        }
    }
}

    /* if (controls.isLocked) {
                        if (keys.includes(controlOptions.forward)) {
                            player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                            forback = 1 * movingSpeed;
                            for (var i = 0; i < chunks.length; i++) {
                                for (var j = 0; j < chunks[i].length; j++) {
                                    var b = chunks[i][j];
                                    var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                                        .h, player.d);
                                    if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                                            2)) && b.blockType != "water") {
                                        player.backward((movingSpeed * (sprint ? sprintSpeedInc : 1)));
                                        forback = 0;
                                        rightleft = 0;
                                        sprint = false;
                                    }
                                }
                            }
                        }
                        if (keys.includes(controlOptions.backward)) {
                            player.backward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                            forback = -1 * movingSpeed;
                            for (var i = 0; i < chunks.length; i++) {
                                for (var j = 0; j < chunks[i].length; j++) {
                                    var b = chunks[i][j];
                                    var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                                        .h, player.d);
                                    if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                                            2)) && b.blockType != "water") {
                                        player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                                        forback = 0;
                                        rightleft = 0;
                                        sprint = false;
                                    }
                                }
                            }
                        }
                        if (keys.includes(controlOptions.right)) {
                            player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
                            rightleft = 1 * movingSpeed;
                            for (var i = 0; i < chunks.length; i++) {
                                for (var j = 0; j < chunks[i].length; j++) {
                                    var b = chunks[i][j];
                                    var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                                        .h, player.d);
                                    if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                                            2)) && b.blockType != "water") {
                                        player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
                                        forback = 0;
                                        rightleft = 0;
                                        sprint = false;
                                    }
                                }
                            }
                        }
                        if (keys.includes(controlOptions.left)) {
                            player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
                            rightleft = -1 * movingSpeed;
                            for (var i = 0; i < chunks.length; i++) {
                                for (var j = 0; j < chunks[i].length; j++) {
                                    var b = chunks[i][j];
                                    var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                                        .h, player.d);
                                    if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                                            2)) && b.blockType != "water") {
                                        player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
                                        forback = 0;
                                        rightleft = 0;
                                        sprint = false;
                                    }
                                }
                            }
                        }
                    }

                    // Decceleration part
                    if (!keys.includes(controlOptions.forward) && !keys.includes(controlOptions.backward) && !keys.includes(
                            controlOptions.right) && !keys.includes(controlOptions.left)) {
                        forback /= deceleration;
                        rightleft /= deceleration;
                        for (var i = 0; i < chunks.length; i++) {
                            for (var j = 0; j < chunks[i].length; j++) {
                                var b = chunks[i][j];
                                var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h,
                                    player.d);
                                if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h / 2))) {
                                    var br = true;
                                    forback /= -deceleration;
                                    rightleft /= -deceleration;
                                    sprint = false;
                                    break;
                                }
                            }
                            if (br) {
                                break;
                            }
                        }
                        player.forward(forback * (sprint ? sprintSpeedInc : 1));
                        player.right(rightleft * (sprint ? sprintSpeedInc : 1));
                    }

                    camera.position.y = camera.position.y - ySpeed;
                    ySpeed = ySpeed + acc;

                    // Not falling through a block or above a block (above collision)
                    for (var i = 0; i < chunks.length; i++) {
                        for (var j = 0; j < chunks[i].length; j++) {
                            var b = chunks[i][j];
                            var c = intersect(b.x, b.y + 10, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h,
                                player.d);
                            if (c && camera.position.y <= chunks[i][j].y + 2.5 + player.h && camera.position.y >= chunks[i][
                                    j
                                ].y && b.blockType != "water") {
                                camera.position.y = chunks[i][j].y + 2.5 + player.h;
                                ySpeed = 0;
                                canJump = true;
                            }
                            var c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h,
                                player.d); // this one doesn't have a + 10 in the b.y
                            if (c && camera.position.y >= chunks[i][j].y - 2.5 && camera.position.y <= chunks[i][j].y && b
                                .blockType != "water") {
                                ySpeed = 0.5;
                            }
                        }
                    }
    */

    var start = 0;
    var sprint = false;
    var slot = 1;
    var blockToBePlaced = hotbar[slot - 1];
    for (var i = 1; i <= 9; i++) {
        document.getElementsByClassName("hotbar")[i - 1].style.opacity = "0.8";
        document.getElementsByClassName("hotbar")[i - 1].style.border = "1px solid white";
        document.getElementsByClassName("hotbar")[i - 1].style.zIndex = "0";
        if (slot == i.toString()) {
            document.getElementsByClassName("hotbar")[i - 1].style.opacity = "1";
            document.getElementsByClassName("hotbar")[i - 1].style.border = "2px solid black";
            document.getElementsByClassName("hotbar")[i - 1].style.zIndex = "1";
        }
    }
    document.addEventListener("keydown", function (e) {
        if (e.key == "w") {
            var elapsed = new Date().getTime();
            if (elapsed - start <= 300) {
                sprint = true;
            }
            start = elapsed;
        }

        // Selecting a slot
        if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
            for (var i = 1; i <= 9; i++) {
                document.getElementsByClassName("hotbar")[i - 1].style.opacity = "0.8";
                document.getElementsByClassName("hotbar")[i - 1].style.border =
                    "1px solid white";
                document.getElementsByClassName("hotbar")[i - 1].style.zIndex = "0";
                if (e.key == i.toString()) {
                    slot = i;
                    blockToBePlaced = hotbar[slot - 1]
                    document.getElementsByClassName("hotbar")[i - 1].style.opacity = "1";
                    document.getElementsByClassName("hotbar")[i - 1].style.border =
                        "2px solid black";
                    document.getElementsByClassName("hotbar")[i - 1].style.zIndex = "1";
                }
            }
        }

        keys.push(e.key);

        if (e.key == controlOptions.jump && canJump == true && controls.isLocked) {
            ySpeed = -1;
            canJump = false;
        }
        if (e.key == controlOptions.placeBlock) {
            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            pointer.x = (0.5) * 2 - 1;
            pointer.y = -1 * (0.5) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            var intersection;
            var next = false;
            var distance = Infinity;
            var placedInWater = false;
            for (var i = 0; i < blocks.length; i++) {
                var int = raycaster.intersectObject(blocks[i].mesh);
                if (int[0] != undefined && int[0].distance < 40 && int[0].distance <
                    distance) {
                    if (blocks[i].name == "water") {
                        placedInWater = true;
                        continue;
                    }
                    next = true;
                    intersection = int;
                    distance = int[0].distance;
                }
            }

            if (next) {
                console.log(intersection[0]);
                var materialIndex = intersection[0].face.materialIndex;
                var position = intersection[0].point; // object with x, y and z coords
                var x = 0;
                var y = 0;
                var z = 0;
                const inc = 2.5;
                switch (materialIndex) {
                    case 0: // right
                        x = position.x + inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 1: // left
                        x = position.x - inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 2: // top
                        x = Math.round(position.x / 5) * 5;
                        y = position.y + inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 3: // bottom
                        x = Math.round(position.x / 5) * 5;
                        y = position.y - inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 4: // front
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z + inc;
                        break;
                    case 5: // back
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z - inc;
                        break;
                }
                y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
                if (y > minWorldY) {
                    var b = new Block(x, y, z, true, blockToBePlaced);
                    if (!intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z,
                            player.w,
                            player.h, player.d)) {
                        chunks[identifyChunk(x, z)].push(b);
                        placedBlocks.push(b);

                        // Placing in water
                        if (placedInWater) {
                            for (var i = 0; i < chunks[identifyChunk(x, z)].length; i++) {
                                if (chunks[identifyChunk(x, z)][i].x == x && chunks[
                                        identifyChunk(x, z)]
                                    [i].y == y && chunks[identifyChunk(x, z)][i].z == z &&
                                    chunks[
                                        identifyChunk(x, z)][i].blockType == "water") {
                                    // found that water block!
                                    chunks[identifyChunk(x, z)].splice(i, 1);
                                    brokenBlocks.push(new Block(x, y, z, false, "water"));
                                    scene.remove(blocks[waterIndex].mesh);
                                    blocks[waterIndex].mesh = new THREE.InstancedMesh(
                                        blockBox, blocks[
                                            waterIndex].materialArray, (renderDistance *
                                            renderDistance * chunkSize * chunkSize *
                                            depth) -
                                        brokenBlocks.length);
                                    blocks[waterIndex].count = 0;
                                    break;
                                }
                            }
                        }

                        // Updated chunks of placed block
                        var index = blockTypes.indexOf(blockToBePlaced);
                        scene.remove(blocks[index].mesh);
                        blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index]
                            .materialArray, (renderDistance * renderDistance *
                                chunkSize *
                                chunkSize * depth) + placedBlocks.length);
                        blocks[index].count = 0;

                        for (var i = 0; i < chunks.length; i++) {
                            for (var j = 0; j < chunks[i].length; j++) {
                                let matrix = new THREE.Matrix4().makeTranslation(
                                    chunks[i][j].x,
                                    chunks[i][j].y,
                                    chunks[i][j].z
                                );
                                if (chunks[i][j].blockType == blockToBePlaced) {
                                    blocks[index].mesh.setMatrixAt(blocks[index].count,
                                        matrix);
                                    blocks[index].count++;
                                }
                                if (chunks[i][j].blockType == "water") {
                                    blocks[waterIndex].mesh.setMatrixAt(blocks[waterIndex]
                                        .count,
                                        matrix);
                                    blocks[waterIndex].count++;
                                }
                            }
                        }
                        scene.add(blocks[index].mesh);
                        scene.add(blocks[waterIndex].mesh);
                    }
                }
            }
        }
    });
    var brokenBlocks = []; document.body.addEventListener("click", function () {
        controls.lock();
        // Breaking blocks
        if (controls.isLocked) {
            // Shooting a ray
            const raycaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            pointer.x = (0.5) * 2 - 1;
            pointer.y = -1 * (0.5) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            var intersection;
            var next = false;
            var distance = Infinity;
            for (var i = 0; i < blocks.length; i++) {
                var int = raycaster.intersectObject(blocks[i].mesh);
                if (int[0] != undefined && int[0].distance < 40 && int[0].distance <
                    distance && blocks[
                        i].name != "water") {
                    next = true;
                    intersection = int;
                    distance = int[0].distance;
                }
            }
            if (intersection[0] != undefined && intersection[0].distance < 40) {
                // finding x, y, z positions of that 
                console.log(intersection[0].point);
                var materialIndex = intersection[0].face.materialIndex;
                var position = intersection[0].point; // object with x, y and z coords
                var x = 0;
                var y = 0;
                var z = 0;
                const inc = 2.5;
                switch (materialIndex) { // finding x, y, z positions of block
                    case 0: // right
                        x = position.x - inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 1: // left
                        x = position.x + inc;
                        y = Math.round(position.y / 5) * 5;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 2: // top
                        x = Math.round(position.x / 5) * 5;
                        y = position.y - inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 3: // bottom
                        x = Math.round(position.x / 5) * 5;
                        y = position.y + inc;
                        z = Math.round(position.z / 5) * 5;
                        break;
                    case 4: // front
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z - inc;
                        break;
                    case 5: // back
                        x = Math.round(position.x / 5) * 5;
                        y = Math.round(position.y / 5) * 5;
                        z = position.z + inc;
                        break;
                }
                // Find block with those x, y, z positions
                // More efficient by finding it inside it's chunk
                var index1 = identifyChunk(x, z);
                var chunk = chunks[index1];
                y = Math.round(y); // sometimes, y is for some reason e.g 4.999999999999
                var blockToBeDestroyed = null; // BLOCK WHICH WILL NOW BE DESTROYED!
                for (var i = 0; i < chunk.length; i++) {
                    if (chunk[i].x == x && chunk[i].y == y && chunk[i].z == z) {
                        // Found the block!
                        if (chunk[i].placed) {
                            // find the placedBlock and remove it
                            for (var j = 0; j < placedBlocks.length; j++) {
                                if (placedBlocks[j].x == x && placedBlocks[j].y == y &&
                                    placedBlocks[j]
                                    .z == z) {
                                    placedBlocks.splice(j, 1);
                                    break;
                                }
                            }
                        } else { // if it is a normal block
                            brokenBlocks.push(new Block(x, y, z, false, chunk[i]
                                .blockType));
                        }
                        blockToBeDestroyed = chunk[i].blockType;
                        chunks[index1].splice(i,
                            1); // block is removed from chunks variable
                        break;
                    }
                }
                // update chunks, array.splice(index, 1);
                var index = blockTypes.indexOf(blockToBeDestroyed);
                scene.remove(blocks[index].mesh);
                blocks[index].mesh = new THREE.InstancedMesh(blockBox, blocks[index]
                    .materialArray, (
                        renderDistance * renderDistance * chunkSize * chunkSize * depth
                    ) +
                    placedBlocks.length);
                blocks[index].count = 0;

                for (var i = 0; i < chunks.length; i++) {
                    for (var j = 0; j < chunks[i].length; j++) {
                        let matrix = new THREE.Matrix4().makeTranslation(
                            chunks[i][j].x,
                            chunks[i][j].y,
                            chunks[i][j].z
                        );
                        if (chunks[i][j].blockType == blockToBeDestroyed) {
                            blocks[index].mesh.setMatrixAt(blocks[index].count, matrix);
                            blocks[index].count++;
                        }
                    }
                }
                scene.add(blocks[index].mesh);
            }
        }
    });
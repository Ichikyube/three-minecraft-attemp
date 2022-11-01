

//Graphics
let muzzleFlash, bulletHoleGraphic;
let camShake;
let camShakeMagnitude, camShakeDuration;
let text;

class Gun {
    constructor(scene, camera, domElement, height) {
        //Gun stats
        this.damage;
        this.timeBetweenShooting;
        this.spread
        this.range
        this.reloadTime
        this.timeBetweenShots;
        this.magazineSize;
        this.bulletsPerTap;
        this.allowButtonHold;
        this.bulletsLeft;
        this.bulletsShot;
        this.fpsView;
        this.attackPoint;
        this.RayHit;
        this.target;
        let shooting, readyToShoot, reloading;
    }

    Awake() {
        bulletsLeft = magazineSize;
        readyToShoot = true;
    }
    Update() {
        MyInput();

        //SetText
        text.SetText(bulletsLeft + " / " + magazineSize);
    }
    MyInput() {
        if (allowButtonHold) shooting = Input.GetKey(KeyCode.Mouse0);
        else shooting = Input.GetKeyDown(KeyCode.Mouse0);

        if (Input.GetKeyDown(KeyCode.R) && bulletsLeft < magazineSize && !reloading) Reload();

        //Shoot
        if (readyToShoot && shooting && !reloading && bulletsLeft > 0) {
            bulletsShot = bulletsPerTap;
            Shoot();
        }
    }
    Shoot() {
        readyToShoot = false;

        //Spread
        let x = Random.Range(-spread, spread);
        let y = Random.Range(-spread, spread);

        //Calculate Direction with Spread
        let direction = fpsCam.transform.forward + new Vector3(x, y, 0);

        //RayCast
        if (Physics.Raycast(fpsCam.transform.position, direction, rayHit, range, whatIsEnemy)) {
            Debug.Log(rayHit.collider.name);

            if (rayHit.collider.CompareTag("Enemy"))
                rayHit.collider.GetComponent < ShootingAi > TakeDamage(damage);
        }

        //ShakeCamera
        camShake.Shake(camShakeDuration, camShakeMagnitude);

        //Graphics
        Instantiate(bulletHoleGraphic, rayHit.point, Quaternion.Euler(0, 180, 0));
        Instantiate(muzzleFlash, attackPoint.position, Quaternion.identity);

        bulletsLeft--;
        bulletsShot--;

        Invoke("ResetShot", timeBetweenShooting);

        if (bulletsShot > 0 && bulletsLeft > 0)
            Invoke("Shoot", timeBetweenShots);
    }
    ResetShot() {
        readyToShoot = true;
    }
    Reload() {
        reloading = true;
        Invoke("ReloadFinished", reloadTime);
    }
    ReloadFinished() {
        bulletsLeft = magazineSize;
        reloading = false;
    }
}
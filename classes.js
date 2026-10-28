class Cookies {
    static setCookie(cname, cvalue) {
        const d = new Date();
        d.setDate(d.getYear() + 10); // Cookies last for a long while
        d.setMinutes(0)
        d.setHours(0)
        d.setSeconds(0)
        d.setMilliseconds(0)
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    static getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return null;
    }

    static clearCookie(cname){
        const d = new Date(0);
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + "0" + ";" + expires + ";path=/";
    }

    static getBool(name){
        let cookie = Cookies.getCookie(name)
        if (cookie == null){
            return null
        }
        return cookie == "true"
    }

    static getInt(name){
        let cookie = Cookies.getCookie(name)
        if (cookie == null){
            return null
        }
        return Number(cookie)
    }
}

class RNG {
    //https://www.xjavascript.com/blog/seeding-the-random-number-generator-in-javascript/#linear-congruential-generators-lcg
    // I have no clue how to take a good pseudorandom number, so heres just a basic one.
    constructor(seed) {
        this.seed = seed;
        this.a = 1103515245; // glibc LCG parameters (widely used)
        this.c = 12345;
        this.m = 2 ** 31; // 2^31 ensures 32-bit output
    }

    // Returns a float in [0, 1)
    next() {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    }

    // Returns an integer in [min, max]
    nextInt(min, max) {
        const range = max - min + 1;
        return Math.floor(this.next() * range) + min;
    }

    static getSeed(day){
        const mod = wordleWordsList.length-1
        return (RNG.getOffset()+day)%mod+1
    }

    static getOffset(){
        const date = Date.now()
        const dateOffset = new Date(0)
        let timedif = date - dateOffset
        return parseInt(Math.ceil(timedif / (1000 * 3600 * 24)))
    }

}
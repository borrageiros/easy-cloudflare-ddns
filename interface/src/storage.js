class Storage {

    parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }

    async setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error setting localStorage key:', key, error);
        }
    }

    async getItem(key) {
        if ( key === "Authorization" ) {
            const auth = localStorage.getItem("Authorization");
            const decode = auth && this.parseJwt(auth);
            const now = Math.floor(Date.now() / 1000);
            if (auth && decode.exp <= now) {
                localStorage.removeItem("Authorization");
                window.location.assign("/login");
                return "";
            }
        }
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error setting localStorage key:', key, error);
        }
    }

    async setObject(key, obj) {
        try {
            const jsonValue = JSON.stringify(obj);
            localStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Error setting localStorage key:', key, error);
        }
    }

    async getObject(key) {
        try {
            const jsonValue = localStorage.getItem(key);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error getting localStorage key:', key, error);
            return null;
        }
    }

    async remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing localStorage key:', key, error);
        }
    }
    
}

export default new Storage();
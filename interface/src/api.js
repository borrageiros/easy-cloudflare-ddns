import storage from './storage';

// --------------------------------------------------------------
export async function login( window, password ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    try {
        const response = await fetch( apiUrl + "/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password
            })
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function generateApiToken( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/generate-api-token", {
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function togglePauseInterval( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/toggle-pause-interval", {
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function getAppSatus( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/app", {
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function forceInterval( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/force-interval", {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function getConfig( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/config", {
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function insertConfig( window, email, token, checkInterval ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/config", {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, token, checkInterval })
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function updateConfig( window, query ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/config", {
            method: 'PUT',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( query )
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function getZones( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/zone", {
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function insertZone( window, name, zoneId) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/zone", {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, zoneId })
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function deleteZone( window, id ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/zone/" + id, {
            method: 'DELETE',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function getRecords( window ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/record", {
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function insertRecord( window, name, zoneId, proxy, ttl ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/record", {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, zoneId, proxy, ttl })
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function updateRecord( window, id, query ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/record/" + id, {
            method: 'PUT',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( query )
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------



// --------------------------------------------------------------
export async function deleteRecord( window, id ) {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const apiUrl = urlObject.origin + "/api";
    const auth = await storage.getItem("Authorization");
    try {
        const response = await fetch( apiUrl + "/record/" + id, {
            method: 'DELETE',
            headers: {
                'Authorization': auth
            }
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}
// --------------------------------------------------------------
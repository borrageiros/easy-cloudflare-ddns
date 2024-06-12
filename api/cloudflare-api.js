const { checkConfig, getConfig } = require("./user-config");

// Check if the zone really exist
async function getZoneInfo( id ) {
  const configExist = await checkConfig();
  if ( configExist ) {
    const config = await getConfig();
    try {
      const response = await fetch( `https://api.cloudflare.com/client/v4/zones/${id}`, {
          method: 'GET',
          headers: {
              'X-Auth-Email': config.email,
              'Authorization': 'Bearer ' + config.token,
              'Content-Type': 'application/json'
          }
      });
      const cloudflareResponse = await response.json();
      if ( cloudflareResponse.success === true && cloudflareResponse.result ) {
        return cloudflareResponse.result;
      }
    } catch (error) {
        throw error;
    }
  }
}

// check if the login data in cloudflare is correct
async function checkAuth( email, token ) {
  if ( email && token ) {
    try {
      const response = await fetch( `https://api.cloudflare.com/client/v4/zones`, {
          method: 'GET',
          headers: {
              'X-Auth-Email': email,
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
          }
      });
      const cloudflareResponse = await response.json();
      if ( cloudflareResponse.success === true ){
        return true;
      } else {
        return false;
      }
    } catch (error) {
        throw error;
    }
  }
}

// update record
async function updateRecord( zoneId, recordId, query ) {
  const configExist = await checkConfig();
  if ( configExist ) {
    const config = await getConfig();
    try {
      const response = await fetch( `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
          method: 'PATCH',
          headers: {
              'X-Auth-Email': config.email,
              'Authorization': 'Bearer ' + config.token,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(query)
      });
      const cloudflareResponse = await response.json();
      return cloudflareResponse;
    } catch (error) {
        throw error;
    }
  }
}

// checks if the given record name is correct and exists (return the id)
async function getRecordId( zoneId, recordName ) {
  const configExist = await checkConfig();
  if ( configExist ) {
    const config = await getConfig();
    try {
      const response = await fetch( `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${recordName}`, {
          method: 'GET',
          headers: {
              'X-Auth-Email': config.email,
              'Authorization': 'Bearer ' + config.token,
              'Content-Type': 'application/json'
          }
      });
      const cloudflareResponse = await response.json();
      if ( cloudflareResponse.success === true && cloudflareResponse.result[0] ) {
        return cloudflareResponse.result[0].id && cloudflareResponse.result[0].id;
      }
    } catch (error) {
        throw error;
    }
  }
}

// Get record IP
async function getRecordIp( zoneId, recordName ) {
  const configExist = await checkConfig();
  if ( configExist ) {
    const config = await getConfig();
    try {
      const response = await fetch( `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${recordName}`, {
          method: 'GET',
          headers: {
              'X-Auth-Email': config.email,
              'Authorization': 'Bearer ' + config.token,
              'Content-Type': 'application/json'
          }
      });
      const cloudflareResponse = await response.json();
      if ( cloudflareResponse.success === true ) {
        return cloudflareResponse.result[0].content;
      }
    } catch (error) {
        throw error;
    }
  }
}

module.exports = {
  getZoneInfo,
  checkAuth,
  getRecordId,
  updateRecord,
  getRecordIp
};

# Easy ☁CloudFlare DDNS

💻 Web Interface - Dynamic DNS service to automatically update CloudFlare records! 

![screenshot](./readme/screenshot.jpg)

# 🚦 Getting Started

Using this application is very simple:  

- Start the application, either with Docker (recommended) or with Node.js
- Enter your CloudFlare credentials (email and API key)
- Create as many zones as you want (domains)
- Create as many records as you want (subdomains)

The application will periodically (time configurable in minutes) check if your device's public IP has changed. If it has, it will update all the specified records in Cloudflare with the new IP. It's that simple!

# 🐳 Docker

> **You can find 2 previous builds on Docker Hub:**  

[Link to DockerHub repository](https://hub.docker.com/repository/docker/borrageiros/easy-cloudflare-ddns/tags)

- **latest**: for amd64 distributions  
    ```
    borrageiros/easy-cloudflare-ddns:latest
    ```

- **arm64**: for arm64 distributions (e.g., Raspberry Pi)  
    ```
    borrageiros/easy-cloudflare-ddns:arm64
    ```  

**(OPTIONAL  & RECOMMENDED)  
You must create a folder for persistent storage.**  
This folder will store your data and an auto-generated code to encrypt the password.  

```
mkdir /path/to/new/folder
```

- Then you can run the Docker CLI command with this folder and the password you want.

Example command:

```
docker run -d
--name=easy-cloudflare-ddns
-v /path/to/new/folder:/usr/src/app/database/data
-p 3000:3000
-e PASSWORD=abc123
borrageiros/easy-cloudflare-ddns
```


## 📝 Node.js Installation

If you want to run the application with Node.js, follow these steps:

#### 🚧 | Prerequisites
- Install -> [Node.js >= 20](https://nodejs.org/en/download/)  
- Install -> [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)  

- Install requirements:  
```
cd easy-cloudflare-ddns
yarn install
```


- Install interface requirements:  
```
cd interface
yarn install
```

- Configure environment variables:  
    Create a `.env` file with the following content:
```
PASSWORD=somepassword123
```

- Run the application:  
```
yarn start
```
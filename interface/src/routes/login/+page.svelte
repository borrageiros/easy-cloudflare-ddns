<script>
    import { login } from '../../api';
    import storage from '../../storage';
    import { onMount } from 'svelte';

    let error;
    let password = "";

    async function signIn() {
        const response = await login( window, password );

        if (response.statusCode !== 200 && response.error) {
            error = response.error;
        } else {
            storage.setItem("Authorization", response.token);
            window.location.assign("/");
        }
    }

    onMount(async () => {
        const session = await storage.getItem("Authorization");
        if (session) {
            window.location.assign("/");
        }
    })
</script>

<div class="main">
    <div class="container">
        <h3 style="margin-bottom: 40px;">
            Easy
            <i style="color: #f68a1d;" class="bi bi-cloud-fill">&nbsp;CloudFlare</i>
            DDNS
        </h3>
        {#if error}
            <p class="error">{error}</p>
        {/if}
        <form on:submit|preventDefault={signIn}>
            <input type="password" placeholder="Password" bind:value={password}>
            <button type="submit">Log in</button>
        </form>
        <p><a class="register" href="https://borrageiros.com">Author @borrageiros</a></p>
    </div>
</div>

<style>
    .main, .container {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        flex-direction: column;
    }

    .container{
        width: 80%;
        max-width: 400px;
        background-color: white;
        border: 1px black solid;
        border-radius: 10px;
        padding: 20px;
    }

    form{
        display: flex;
        flex-direction: column;
    }

    input[type="password"],
    button {
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 100%;
        box-sizing: border-box;
    }

    button {
        background-color: #007bff;
        color: #fff;
        cursor: pointer;
    }

    a {
        margin-right: 10px;
        text-decoration: none;
    }
    a:link {
      color: blue;
      text-decoration: none;
    }
    a:visited {
      color: blue;
    }

    .register{
        margin-top: 20px;
    }

    .error {
        color: red;
        margin-bottom: 10px;
    }

    @media screen and (max-width: 768px) {
        .container {
            width: 90%;
        }
    }

    @media screen and (max-width: 480px) {
        .container {
            width: 95%;
        }
    }
</style>

<script>
	import { login } from "../../api";
	import storage from "../../storage";
	import { onMount } from "svelte";
	import ThemeToggle from "../../components/ThemeToggle.svelte";

	let error;
	let password = "";

	async function signIn() {
		const response = await login(window, password);

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
	});
</script>

<div class="main">
	<div class="container">
		<div class="theme-toggle-wrapper">
			<ThemeToggle />
		</div>
		<h3 class="title">
			Easy
			<i class="highlight bi bi-cloud-fill">&nbsp;CloudFlare</i>
			DDNS
		</h3>
		{#if error}
			<p class="error">{error}</p>
		{/if}
		<form on:submit|preventDefault={signIn}>
			<input type="password" placeholder="Password" bind:value={password} />
			<button type="submit">Log in</button>
		</form>
		<p>
			<a class="register" href="https://borrageiros.com">Author @borrageiros</a>
		</p>
	</div>
</div>

<style>
	:root {
		--main-padding: 40px;
		--font-size: 16px;
	}

	.main,
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		flex-direction: column;
		background-color: var(--card-background);
		color: var(--text-color);
		padding: var(--main-padding);
	}

	.container {
		position: relative;
		width: 80%;
		max-width: 400px;
		border: 1px solid var(--border-color);
		border-radius: 10px;
		padding: 30px 15px 20px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.theme-toggle-wrapper {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.title {
		margin: 20px 0;
		font-size: calc(var(--font-size) * 1.2);
	}

	.highlight {
		color: #f68a1d;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	input[type="password"],
	button {
		margin-bottom: 15px;
		padding: 10px;
		border: 1px solid var(--input-border);
		border-radius: 5px;
		width: 100%;
		box-sizing: border-box;
		background-color: var(--input-background);
		color: var(--text-color);
		font-size: calc(var(--font-size) * 1);
	}

	button {
		background-color: #007bff;
		color: #fff;
		cursor: pointer;
	}

	a {
		text-decoration: none;
	}
	a:link,
	a:visited {
		color: blue;
	}

	.register {
		margin-top: 15px;
		font-size: calc(var(--font-size) * 0.9);
	}

	.error {
		color: red;
		margin-bottom: 10px;
	}

	/* Responsivo para dispositivos pequeños */
	@media screen and (max-width: 768px) {
		:root {
			--main-padding: 20px;
		}

		.container {
			width: 90%;
		}

		.title {
			font-size: calc(var(--font-size) * 1.1);
		}
	}

	@media screen and (max-width: 480px) {
		:root {
			--font-size: 14px;
		}

		.container {
			width: 95%;
			padding: 20px 10px;
		}

		.title {
			font-size: calc(var(--font-size) * 1);
		}

		input[type="password"],
		button {
			font-size: calc(var(--font-size) * 0.9);
		}

		.register {
			font-size: calc(var(--font-size) * 0.8);
		}
	}
</style>

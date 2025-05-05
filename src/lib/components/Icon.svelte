<script lang="ts">
	import { icons, flags } from '$lib/icons';
	
	export let name = '';
	export let size = 24;
	export let strokeWidth = 2;
	export let color = 'currentColor';
	export let className = '';
	export let type: 'icon' | 'flag' = 'icon';
</script>

{#if type === 'icon' && icons[name]}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		class="feather {className}"
		{...$$restProps}
	>
		{@html icons[name]}
	</svg>
{:else if type === 'flag' && flags[name]}
	<svg
		width={size}
		height={size}
		viewBox="0 0 640 480"
		fill={color}
		class="flag {className}"
		{...$$restProps}
	>
		{@html flags[name]}
	</svg>
{:else}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		class="feather feather-help-circle {className}"
		{...$$restProps}
	>
		<circle cx="12" cy="12" r="10"></circle>
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
		<line x1="12" y1="17" x2="12.01" y2="17"></line>
	</svg>
{/if} 
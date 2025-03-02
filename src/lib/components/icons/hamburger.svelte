<script lang='ts'>
  const { size = 24, color = 'currentColor' } = $props();
</script>

<svg
  xmlns='http://www.w3.org/2000/svg'
  width={size}
  height={size}
  fill='none'
  viewBox='0 0 24 24'
  stroke={color}
>
  <path
    stroke-linecap='round'
    stroke-linejoin='round'
    stroke-width='2'
    d='M4 6h16M4 12h16M4 18h16'
  />
</svg>

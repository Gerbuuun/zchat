<script lang='ts'>
  const { 
    children,
    class: className,
    ...rest
  } = $props();
</script>

<div class='bg-white rounded-lg shadow p-2 md:p-4 {className}' {...rest}>
  {@render children()}
</div>

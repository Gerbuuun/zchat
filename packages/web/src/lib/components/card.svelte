<script lang='ts'>
  const {
    children,
    class: className,
    ...rest
  } = $props();
</script>

<div class='bg-white dark:bg-gray-700 dark:text-gray-300 rounded-lg shadow p-2 md:p-4 {className}' {...rest}>
  {@render children()}
</div>

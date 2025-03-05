<script lang='ts'>
  import { micromark } from 'micromark';
  import { gfm } from 'micromark-extension-gfm';
  import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';

  const { content }: { content: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html micromark(content, {
  extensions: [gfm(), gfmTable()],
  htmlExtensions: [gfmTableHtml()],
})}

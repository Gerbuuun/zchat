<script lang='ts'>
  import { micromark } from 'micromark';
  import { gfm } from 'micromark-extension-gfm';
  import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';

  const { content }: { content: string } = $props();
</script>

<div class='markdown-content'>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html micromark(content, {
    extensions: [gfm(), gfmTable()],
    htmlExtensions: [gfmTableHtml()],
  })}
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
  /* Styling for parsed markdown content */
  :global(.markdown-content) {
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.25rem;
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }

    ul,
    ol {
      margin-left: 1.5rem;
      margin-bottom: 0.75rem;
    }

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
    }

    li {
      margin-bottom: 0.25rem;
    }

    a {
      text-decoration: underline;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
      background-color: #0002;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
    }

    pre {
      background-color: #0002;
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 1rem;
      font-style: italic;
      margin-bottom: 1rem;
    }

    hr {
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin: 1.5rem 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    th,
    td {
      border: 1px solid #e5e7eb;
      padding: 0.5rem;
      text-align: left;
    }

    th {
      font-weight: 600;
    }
  }
</style>

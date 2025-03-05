function Card($$payload, $$props) {
  const { children } = $$props;
  $$payload.out += `<div class="bg-white rounded-lg shadow p-2 md:p-4">`;
  children($$payload);
  $$payload.out += `<!----></div>`;
}
export {
  Card as C
};

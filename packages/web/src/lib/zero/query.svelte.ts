import type { Schema } from '@rocicorp/zero';
import type { Query as ZeroQuery } from '@rocicorp/zero/advanced';
import { Query } from 'zero-svelte';

/**
 * Wrapper around the zero-svelte Query class. To enable reactive queries.
 * @param queryFactory - A function that returns a query
 * @param enabled - Whether the query should be enabled
 * @returns A proxy to the zero-svelte Query class
 */
export function useQuery<
  TSchema extends Schema,
  TTable extends keyof TSchema['tables'] & string,
  TReturn,
>(queryFactory: () => ZeroQuery<TSchema, TTable, TReturn>, enabled: boolean = true) {
  let query = $state<Query<TSchema, TTable, TReturn>>(new Query(queryFactory(), enabled));

  $effect(() => {
    query = new Query(queryFactory(), enabled);
  });

  return new Proxy({} as Query<TSchema, TTable, TReturn>, {
    get(target, prop) {
      return query[prop as keyof typeof query];
    },
  });
}

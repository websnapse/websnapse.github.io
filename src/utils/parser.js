export const parse_rule = (definition) => {
  const pattern =
    '/^((?<bound>.*)/)?(?<consumption_bound>[a-z](^((?<consumed_single>[^0,1,D])|({(?<consumed_multiple>[2-9]|[1-9][0-9]+)})))?) \\to (?<production>([a-z]((^((?<produced_single>[^0,1,D])|({(?<produced_multiple>[2-9]|[1-9][0-9]+]*)})))?;(?<delay>[0-9]|[1-9][0-9]*))|(?<forgot>0)))$/';

  const result = definition.match(pattern);

  if (result === null) {
    return [0, 0, 0, 0];
  }

  const consumption =
    result.groups.consumed_single || result.groups.consumed_multiple || 1;
  const production =
    result.groups.produced_single || result.groups.produced_multiple || 1;
  const delay = result.groups.delay || 1;

  const bound = result.groups.bound || result.groups.consumption_bound;

  return [bound, consumption, production, delay];
};

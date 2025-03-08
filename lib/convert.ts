type ArrayOutput = any[][]
// operating under the assumption that each item in an array will be of the same type?
type Item = { [key: string]: any } & Object
type Input = Item[]
type WriteContext = {
  out: ArrayOutput;
  headers: string[];
  position: { index: number; key: string };
}

export function convertToArray(expr: Input): ArrayOutput {
  const headers = Object.keys(expr[0])
  const out = expr.map(row => {
    return headers.map(header => row[header])
  })

  const context = {
    out,
    headers,
    position: { index: 0, key: headers[0] }
  }

  // if (expr instanceof Object && !isEmpty(expr)) {
  //   return unfoldObject(expr, context)
  // }

  // else if (expr instanceof Array) {
  //   return unfoldArray(expr, context).out
  // }

  return context.out
}

export function unfoldObject(expr: Item, context: WriteContext): ArrayOutput {
  // need some way of storing whether the keys have been added/seen already.
  // return out
}

export function unfoldArray(expr: any[], context: WriteContext): WriteContext {
  const out = context.out
  const colNo = context.headers.findIndex(v => v === context.position.key)
  let index = context.position.index

  const curRow = out[index]
  curRow[colNo] = expr[0]

  // unfold remaining items
  for (const item of expr.slice(1)) {
    const newRow = deepCopy(curRow)
    // place item in correct pos
    newRow[colNo] = item
    out.splice(++index, 0, newRow)
  }

  // index of prev record
  context.position.index = index;

  return context
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0
}

function deepCopy(obj: Object) {
  return JSON.parse(JSON.stringify(obj))
}


export function convertToString(instances: Input, delimiter: string = ","): string {
  // any array we meet must have items of the same type
  const flattenedArray: ArrayOutput = convertToArray(instances)

  const out = flattenedArray
    .map(row => row.join(delimiter))
    .join("\n")

  // if not empty, pad ending with \n
  return (out == "") ? "" : out + "\n"
}

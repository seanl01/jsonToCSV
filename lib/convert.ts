// operating under the assumption that each item in an array will be of the same type?
type Item = { [key: string]: any } & Object
type Input = Item[]

interface FlattenObjOpts {
  keyDelimiter: string
  maxLevel?: number
  _level: number
}

const defaultFlattenObjOpts: FlattenObjOpts = {
  keyDelimiter: "_",
  _level: 0
}

export function flatten(items: Item[] | Item, opts: FlattenObjOpts = defaultFlattenObjOpts): Item[] {
  let out: Item[] = []

  if (items instanceof Array) {
    for (const item of items) {
      out = out.concat(flatten(item, opts))
    }
    return out
  }

  // ELSE: one object
  // flatten as per normal
  const obj = flattenObj(items, opts)

  let containsArrays = false

  for (const key of Object.keys(obj)) {
    // handle arrays
    if (items[key] instanceof Array) {
      containsArrays = true
      const arr = items[key]
      out.push(obj) // push first object

      if (arr.length === 0) {
        out[0][key] = null
        continue
      }

      out[0][key] = arr[0]

      for (const arrItem of arr.slice(1)) {
        const itemToAdd = { ...items } // shallow Copy
        itemToAdd[key] = arrItem
        out.push(itemToAdd)
      }
    }
  }

  if (!containsArrays) return [obj]

  // if you don't put it through flatten again, you might not end up fully flattening everything.
  return flatten(
    out.map(it => flatten(it, opts)), opts)
}

export function flattenObj(item: Item, opts: FlattenObjOpts = defaultFlattenObjOpts): Item {
  // empty object
  if (isEmpty(item))
    return item

  for (const key of Object.keys(item)) {
    if (item[key] instanceof Array)
      continue

    // ignore non object structures.
    if (!(item[key] instanceof Object))
      continue

    const flattenItem = flattenObj(item[key])

    for (const flatKey of Object.keys(flattenItem)) {
      const newKey = `${key}${opts.keyDelimiter}${flatKey}`
      item[newKey] = flattenItem[flatKey]
    }

    delete item[key] // remove original record
  }

  // primitive
  return item
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0
}

function deepCopy(obj: Object) {
  return JSON.parse(JSON.stringify(obj))
}

export function convertToString(instances: Input, delimiter: string = ",", _opts: FlattenObjOpts = defaultFlattenObjOpts): string {
  if (instances.length === 0) return ""

  // any array we meet must have items of the same type
  const flattenedArray: Item[] = flatten(instances)
  const keys = Object.keys(flattenedArray[0]).sort()

  // add headers
  const header = keys.join(delimiter) + "\n"

  const out = flattenedArray
    .map(row =>
      keys.map(key => {
        const item = row[key]
        return (typeof item === "string") ? item.replace(",", "\,") : item
      })
        .join(delimiter)
    )
    .join("\n")

  // if not empty, pad ending with \n
  return (out == "") ? "" : (header + out) + "\n"
}

export function* makeRowGenerator(instances: Input, delimiter: string = ",", _opts: FlattenObjOpts = defaultFlattenObjOpts): IterableIterator<string> {
  if (instances.length === 0) yield ""

  // any array we meet must have items of the same type
  const flattenedArray: Item[] = flatten(instances)
  const keys = Object.keys(flattenedArray[0]).sort()
  const header = keys.join(delimiter) + "\n"

  yield header


  for (const row of flattenedArray) {
    let out = keys.map(key => {
      const item = row[key]
      return (typeof item === "string") ? item.replace(",", "\,") : item
    })
      .join(delimiter)

    out += "\n"
    yield out;
  }
}

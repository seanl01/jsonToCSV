type ArrayOutput = any[][]
// operating under the assumption that each item in an array will be of the same type?
type Item = { [key: string]: any } & Object
type Input = Item[]

export function convertToArray(instances: Input): ArrayOutput {
  function convertToArrayRecur(instances: Input | Item, out: ArrayOutput, headers: Map<string, number>): ArrayOutput {
    // base case: empty array
    if (instances.length === 0) {
      return []
    }
    // Array of consistent objects means out must grow vertically
    if (instances instanceof Array && instances.length > 0) {
      // add to headers
      convertToArrayRecur(instances[0], out, headers)

      for (const row of instances) {
        out.push(Object.values(row))
        console.log(out)
      }

    }

    // Object means out must grow horizontally, including headers
    else if (instances instanceof Object) {
      for (const key of Object.keys(instances)) {
      }
    }

    // primitive
    else {
    }

    return out
  }

  // return convertToArrayRecur(instances, [[]])
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

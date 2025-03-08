import { test, describe, expect } from "bun:test"
import { convertToString, flattenObj, flatten } from "./lib/convert"

// test
// test("Test empty json", () => {
//   expect(
//     convertToString([])
//   ).toEqual("")
// })

// describe.skip("Test json to array, non-nested", () => {

//   const testCases = [
//     {
//       name: "single level json",
//       input: "data/00_singleLevel.json",
//       output: "data/00_singleLevel.csv"
//     },
//     {
//       name: "nested JSON flatten. Two level total",
//       input: "data/01_nested.json",
//       output: "data/01_nested.csv"
//     },
//     {
//       name: "JSON with array of primitives",
//       input: "data/02_arrayOfPrimitives.json",
//       output: "data/02_arrayOfPrimitives.csv"
//     },
//     {
//       name: "JSON with array of objects",
//       input: "data/03_arrayOfObjects.json",
//       output: "data/03_arrayOfObjects.csv"
//     },
//     // {
//     //   name: "negative case: array with inconsistent object schema",
//     //   input: "data/04_inconsistentArray.json",
//     //   output: "data/04_inconsistentArray.csv"
//     // }
//   ];

//   test.each(testCases)("Test $name", async ({ input, output }) => {
//     const inputFile = Bun.file(input)
//     const outFile = Bun.file(output)

//     const obj = await inputFile.json()
//     const arr = convertToString(obj)
//     expect(arr).toEqual(await outFile.text())
//   })

// })

describe("flattenObj", () => {
  test("test on simple nested object without arrays", () => {
    const out = flatten({
      id: 1, name: "John", age: 25, bio: {
        height: 1.75, weight: 75
      }
    })

    expect(out).toStrictEqual({
      id: 1, name: "John", age: 25, bio_height: 1.75, bio_weight: 75
    })
  })


  test("flatten obj with arrays", () => {
    const out = flatten({
      id: 1, name: "John", age: 25, hobbies: ["reading", "hiking"]
    })

    expect(out).toStrictEqual([
      { id: 1, name: "John", age: 25, hobbies: "reading" },
      { id: 1, name: "John", age: 25, hobbies: "hiking" }
    ])
  })

  test("flatten obj with array of nested object", () => {
    const out = flatten({
      id: 1, name: "John", age: 25, children: [{ name: "Alice", age: 5 }, { name: "Bob", age: 10 }]
    })

    expect(out).toStrictEqual([
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5 },
      { id: 1, name: "John", age: 25, children_name: "Bob", children_age: 10 }
    ])
  })

  test("flatten array of objects with array of nested object", () => {
    const out = flatten([
      {
        id: 1, name: "John", age: 25, children: [{ name: "Alice", age: 5 }, { name: "Bob", age: 10 }]
      },
      {
        id: 2, name: "Jane", age: 30, children: [{ name: "Alice", age: 5 }, { name: "Bob", age: 10 }]
      },
      {
        id: 3, name: "Bob", age: 20, children: [{ name: "Alice", age: 5 }, { name: "Bob", age: 10 }]
      }
    ])

    expect(out).toStrictEqual([
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5 },
      { id: 1, name: "John", age: 25, children_name: "Bob", children_age: 10 },
      { id: 2, name: "Jane", age: 30, children_name: "Alice", children_age: 5 },
      { id: 2, name: "Jane", age: 30, children_name: "Bob", children_age: 10 },
      { id: 3, name: "Bob", age: 20, children_name: "Alice", children_age: 5 },
      { id: 3, name: "Bob", age: 20, children_name: "Bob", children_age: 10 }
    ])
  })

  test("flatten array of objects with array of nested object", () => {
    const out = flatten([
      {
        id: 1, name: "John", age: 25, children: [{
          name: "Alice", age: 5, children: [
            { name: "Peter", age: 10 },
            { name: "Sydney", age: 12 }
          ]
        }, {
          name: "Bob", age: 10, children: [
            { name: "Peter", age: 10 },
            { name: "Sydney", age: 12 }
          ]
        }]
      },
      {
        id: 2, name: "Jane", age: 30, children: [{
          name: "Alice", age: 5, children: [
            { name: "Peter", age: 10 },
            { name: "Sydney", age: 12 }
          ]
        }, {
          name: "Bob", age: 10, children: [
            { name: "Peter", age: 10 },
            { name: "Sydney", age: 12 }
          ]
        }]
      },
    ])

    expect(out).toStrictEqual([
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5, children_children_name: "Peter", children_children_age: 10 },
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5, children_children_name: "Sydney", children_children_age: 12 },
      { id: 1, name: "John", age: 25, children_name: "Bob", children_age: 10, children_children_name: "Peter", children_children_age: 10 },
      { id: 1, name: "John", age: 25, children_name: "Bob", children_age: 10, children_children_name: "Sydney", children_children_age: 12 },
      { id: 2, name: "Jane", age: 30, children_name: "Alice", children_age: 5, children_children_name: "Peter", children_children_age: 10 },
      { id: 2, name: "Jane", age: 30, children_name: "Alice", children_age: 5, children_children_name: "Sydney", children_children_age: 12 },
      { id: 2, name: "Jane", age: 30, children_name: "Bob", children_age: 10, children_children_name: "Peter", children_children_age: 10 },
      { id: 2, name: "Jane", age: 30, children_name: "Bob", children_age: 10, children_children_name: "Sydney", children_children_age: 12 }
    ])
  })
})

// describe("convertToArray", () => {
//   const expr = [
//     { id: 1, name: "John", age: 25, hobbies: [] },
//     { id: 2, name: "Jane", age: 30, hobbies: ["reading", "hiking"] },
//     { id: 3, name: "Bob", age: 20, hobbies: ["reading", "hiking"] }
//   ]

//   test("should correctly handle first level conversion", () => {
//     const out = convertToArray(expr, true)

//     expect(out).toStrictEqual(
//       [
//         // ["id", "name", "age", "hobbies"],
//         [1, "John", 25, []],
//         [2, "Jane", 30, ["reading", "hiking"]],
//         [3, "Bob", 20, ["reading", "hiking"]]
//       ]
//     )
//   });

//   test("should correct unfold one level nesting", () => {
//     const out = convertToArray(expr)

//     expect(out).toStrictEqual(
//       [
//         // ["id", "name", "age", "hobbies"],
//         [1, "John", 25, null],
//         [2, "Jane", 30, "reading"],
//         [2, "Jane", 30, "hiking"],
//         [3, "Bob", 20, "reading"],
//         [3, "Bob", 20, "hiking"]
//       ]
//     )
//   })
// });

// describe("unfold array", () => {
//   const arr = [
//     "hello",
//     "bye",
//     "wow"
//   ]

//   test("should correctly unfold nested arrays", () => {
//     const curr = [
//       [1, "wow"],
//       [1, "wowzers"],
//       [2, arr],
//       [3, ["hello"]]
//     ]

//     const ctx = unfoldArray({
//       out: curr,
//       headers: ["A", "B"],
//       position: { index: 2, key: "B" },
//     })

//     const { out, position: { index } } = ctx

//     expect(out).toEqual([
//       [1, "wow"],
//       [1, "wowzers"],
//       [2, "hello"],
//       [2, "bye"],
//       [2, "wow"],
//       [3, ["hello"]]
//     ])

//     expect(index).toEqual(4)
//   })
// })

// describe("test schema reflection", () => {
//   test("test schema", () => {

//   })
// })

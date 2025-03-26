import { test, describe, expect, it } from "bun:test"
import { convertToString, flattenObj, flatten, makeRowGenerator, escapeCsvValue } from "./lib/convert"

test("Test empty json", () => {
  expect(
    convertToString([])
  ).toEqual("")
})

describe("Test json to array, non-nested", () => {

  const testCases = [
    {
      name: "single level json",
      input: "data/00_singleLevel.json",
      output: "data/00_singleLevel.csv"
    },
    {
      name: "random test",
      input: "data/private/05_random.json",
      output: "data/private/05_random.csv",
    },
    {
      name: "test with forbidden characters",
      input: "data/01_forbidden.json",
      output: "data/01_forbidden.csv"
    }
    // {
    //   name: "nested JSON flatten. Two level total",
    //   input: "data/01_nested.json",
    //   output: "data/01_nested.csv"
    // },
    // {
    //   name: "JSON with array of primitives",
    //   input: "data/02_arrayOfPrimitives.json",
    //   output: "data/02_arrayOfPrimitives.csv"
    // },
    // {
    //   name: "JSON with array of objects",
    //   input: "data/03_arrayOfObjects.json",
    //   output: "data/03_arrayOfObjects.csv"
    // },
    // {
    //   name: "negative case: array with inconsistent object schema",
    //   input: "data/04_inconsistentArray.json",
    //   output: "data/04_inconsistentArray.csv"
    // }
  ];

  test.each(testCases)("Test $name", async ({ input, output }) => {
    const inputFile = Bun.file(input)
    const outFile = Bun.file(output)

    const obj = await inputFile.json()
    const arr = convertToString(obj)
    expect(arr).toEqual(await outFile.text())
  })

})

describe("flattenObj", () => {
  test("test on simple nested object without arrays", () => {
    const out = flatten({
      id: 1, name: "John", age: 25, bio: {
        height: 1.75, weight: 75
      }
    })

    expect(out).toStrictEqual([{
      id: 1, name: "John", age: 25, bio_height: 1.75, bio_weight: 75
    }])
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

  test("flatten array of objects with array of doubly nested objects", () => {
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

  test("flatten array of objects with array of doubly nested objects and primitives", () => {
    const out = flatten([
      {
        id: 1, name: "John", age: 25, children: [{
          name: "Alice", age: 5, children: [
            { name: "Peter", age: 10, hobbies: ["swimming", "kayaking"] },
            { name: "Sydney", age: 12, hobbies: [] }
          ]
        }, {
          name: "Bob", age: 10, children: [
            { name: "Peter", age: 10, hobbies: [] },
            { name: "Sydney", age: 12, hobbies: [] }
          ]
        }]
      },
      {
        id: 2, name: "Jane", age: 30, children: [{
          name: "Alice", age: 5, children: [
            { name: "Peter", age: 10, hobbies: [] },
            { name: "Sydney", age: 12, hobbies: [] }
          ]
        }, {
          name: "Bob", age: 10, children: [
            { name: "Peter", age: 10, hobbies: [] },
            { name: "Sydney", age: 12, hobbies: [] }
          ]
        }]
      },
    ])

    expect(out).toStrictEqual([
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5, children_children_name: "Peter", children_children_age: 10, children_children_hobbies: "swimming" },
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5, children_children_name: "Peter", children_children_age: 10, children_children_hobbies: "kayaking" },
      { id: 1, name: "John", age: 25, children_name: "Alice", children_age: 5, children_children_name: "Sydney", children_children_age: 12, children_children_hobbies: null },
      { id: 1, name: "John", age: 25, children_name: "Bob", children_age: 10, children_children_name: "Peter", children_children_age: 10, children_children_hobbies: null },
      { id: 1, name: "John", age: 25, children_name: "Bob", children_age: 10, children_children_name: "Sydney", children_children_age: 12, children_children_hobbies: null },
      { id: 2, name: "Jane", age: 30, children_name: "Alice", children_age: 5, children_children_name: "Peter", children_children_age: 10, children_children_hobbies: null },
      { id: 2, name: "Jane", age: 30, children_name: "Alice", children_age: 5, children_children_name: "Sydney", children_children_age: 12, children_children_hobbies: null },
      { id: 2, name: "Jane", age: 30, children_name: "Bob", children_age: 10, children_children_name: "Peter", children_children_age: 10, children_children_hobbies: null },
      { id: 2, name: "Jane", age: 30, children_name: "Bob", children_age: 10, children_children_name: "Sydney", children_children_age: 12, children_children_hobbies: null }
    ])
  })

})

test("can handle missing attributes", () => {
  const input = [
    { id: 1, name: "John", age: 25, hobbies: ["reading", "hiking"] },
    { id: 2, name: "Jane", age: 30 },
    { id: 3, name: "Bob", age: 20, children: [{ name: "Alice", age: 5 }, { name: "Bob", age: 10 }] },
  ]

  expect(flatten(structuredClone(input))).toStrictEqual([
    { id: 1, name: "John", age: 25, hobbies: "reading" },
    { id: 1, name: "John", age: 25, hobbies: "hiking" },
    { id: 2, name: "Jane", age: 30 },
    { id: 3, name: "Bob", age: 20, children_name: "Alice", children_age: 5 },
    { id: 3, name: "Bob", age: 20, children_name: "Bob", children_age: 10 }
  ])

  expect(convertToString(input)).toEqual("age,hobbies,id,name\n25,reading,1,John\n25,hiking,1,John\n30,,2,Jane\n20,,3,Bob\n20,,3,Bob\n")
})

describe("makeRowGenerator", () => {
  test("test row generator", () => {
    let out = ""
    const instances = [
      { id: 1, name: "John", age: 25, hobbies: ["reading", "hiking"] },
      { id: 2, name: "Jane", age: 30, hobbies: ["swimming", "kayaking"] }
    ]
    for (const row of makeRowGenerator(instances)) {
      out += row
    }

    expect(out).toEqual("age,hobbies,id,name\n25,reading,1,John\n25,hiking,1,John\n30,swimming,2,Jane\n30,kayaking,2,Jane\n")
  });
});

describe("test escaping", () => {
  test("should escape commas", () => {
    expect(escapeCsvValue("hello, bye")).toEqual('"hello, bye"')
  })
  test("should escape double quotes", () => {
    expect(escapeCsvValue('hello "')).toEqual('"hello """')
  })
  test("should escape newline chars", () => {
    expect(escapeCsvValue("hello\nbye")).toEqual('"hello\nbye"')
  })
})

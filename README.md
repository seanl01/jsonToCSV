# jsontocsv

This library provides a function to flatten a complex list or object as you would find in JSON into a list of records, in CSV format.

## Installation and Usage

```
npm i @sean-lim/jsontocsv
```

Flatten JSON data into CSV friendly format (array of single-level objects) using `flatten`.

### Primary methods

```typescript
import { flatten, makeRowGenerator, converToString } from "@sean-lim/jsontocsv";

const data = [
  {
    a: 1,
    b: "hello",
    c: {
      d: 2,
      e: "world",
    },
    f: [1, 2, 3],
  },
  {
    a: 4,
    b: "goodbye",
    c: {
      d: 5,
      e: "moon",
    },
    f: [],
  },
];

const csv = flatten(data); // returns an array of single-level objects
console.table(csv);

const csvString = convertToString(csv); // Convert to CSV string
console.log(csvString);

const rowGen = makeRowGenerator(csv); // creates a row generator
```

### Writing to a file using row generator

The library doesn't provide a function that performs I/O, so the developer is free to use their preferred method. The generator helps to write to a file row by row, so that large files can be written without loading the entire file into memory, while allowing for asynchronous writing.

**Example usage with `fs.promises`**

```typescript
import { promises as fs } from "fs";

async function write(outputPath: string) {
  for (const row of rowGen) {
    await fs.appendFile(outputPath, row, "utf8");
  }
}

(async () => {
  await write("output.csv");
  console.log("Write completed");
})(); // self-invoking async function in case top-level await is not supported
```

## Background

This library relies on the observation that nested objects in JSON tend to grow a table horizontally, while arrays grow a table vertically. Essentially when a nested object is flattened, its attributes become separate "columns" in the table. For illustration:

```json
[{
  "a": {
    "b": 1
    "c": 2
  }
}]
```

A single record that includes a nested object, would map to two columns in the table under `a`, namely something like `a.b` and `a.c`. The CSV output would look like:

| a.b | a.c |
| --- | --- |
| 1   | 2   |

On the other hand, when dealing with arrays, the array is "unrolled" into separate records. For illustration:

```json
[{
  "a": [1, 2, 3]
  "b": "hello"
}]

```

Would produce a table with three records, one for each element in the array `a`. The CSV output would look like:

| a   | b     |
| --- | ----- |
| 1   | hello |
| 2   | hello |
| 3   | hello |

Notice how the value of `b` is duplicated for each record. A combination of these two approaches is used to flatten even complex JSON objects into CSV format.

### Approach

The implementation approach assumes that each record provided has the same structure, though each record is allowed to be nested and complex. Structural recursion is used to traverse the object. An array of flattened objects (no nesting) is used to represent the output table.

A helper function `flattenObj` is used when an attribute is an object. It recursively flattens the object, replacing the original attribute key with several keys, one for each attribute of the object. A delimiter can be specified to separate each level of the hierarchy, as shown in the example above.

The main function `flatten` is used to flatten the entire list of records. It unrolls arrays but creating a new record for each element in the array, making sure to call `flatten` recursively for each array item and duplicate the surrounding attributes for each record. Empty arrays are treated as missing values.

### Limitations

- The structural recursion approach might not be the most efficient, as it requires a lot of copying of objects. However, it is simple and easy to understand.

- There is no control over how much unfolding of the JSON is done. It is flattened to the maximum depth.

- I have seen that it is possible to use stacks and queues to implement a more efficient version of this algorithm. I may attempt this in the future.

- There are also some potentially parallelisable parts of the algorithm, but this is not trivial, as the structure of the data is not fully known in advance. Further, javascript doesn't have the most complete primitives for parallelism as far as I know.

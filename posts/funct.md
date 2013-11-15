# Working with Native Arrays

In JavaScript, arrays can be created with the `Array` constructor, or using the `[]` convenience shortcut, which is also the preferred approach. Arrays inherit from the `Object` prototype and they haven't a special value for `typeof`, they return `'object'` too. Using `[] instanceof Array`, however, returns true. That being said, there are also _Array-like objects_ which complicate matters, [such as strings, or the `arguments` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments "The arguments object - MDN"). The `arguments` object is not an instance of `Array`, but it still has a `length` property, and its values are indexed, so it can be looped like any Array.

In this article I'll go over a few of the methods on the `Array` prototype, and explore the possibilities each of these methods unveil.

- Looping with `.forEach`
- Asserting with `.some` and `.every`
- Stacks and queues with `.pop`, `.push`, `.shift`, and `.unshift`
- Model mapping with `.map`
- Querying with `.filter`
- Ordering with `.sort`
- Computing with `.reduce`, `.reduceRight`
- Copying a `.slice`
- The power of `.splice`
- Lookups with `indexOf`
- The `in` operator
- Going in `.reverse`
- Subtleties in `.join` and `.concat`
- Memoization

![console.png][1]

You can copy and paste any of the examples in your browser's console, I sure did!

### Looping with `.forEach`

This is one of the simplest methods in a native JavaScript Array. [Unsurprisingly unsupported™](http://kangax.github.io/es5-compat-table/#Array.prototype.forEach "ECMAScript 5 compatibility table") in IE7 and IE8.

`forEach` takes a callback which is invoked once for each element in the array, and gets passed three arguments.

- `value` containing the current array element
- `index` is the element's position in the array
- `array` is a reference to the array

Furthermore, we could pass an optional second argument which will become the context (`this`) for each function call.

```js
['_', 't', 'a', 'n', 'i', 'f', ']'].forEach(function (value, index, array) {
	this.push(String.fromCharCode(value.charCodeAt() + index + 2))
}, out = [])

out.join('')
// <- 'awesome'
```

I cheated with `.join` which we didn't cover _yet_, but we'll look at it soon. In this case, it joins together the different elements in the array, effectively doing something like `out[0] + '' + out[1] + '' + out[2] + '' + out[n]`. We **can't break `forEach` loops**, and throwing exceptions wouldn't be very sensible. Luckily, we have other options available to us in those cases where we might want to short-circuit a loop.

### Asserting with `.some` and `.every`

If you've ever worked with .NET's enumerables, these methods are the _poorly named_ cousins of [`.Any(x => x.IsAwesome)`](http://msdn.microsoft.com/en-us/library/bb534972(v=vs.110).aspx "IEnumerable.Any<TSource> in .NET 4.5") and [`.All(x => x.IsAwesome)`](http://msdn.microsoft.com/en-us/library/bb548541(v=vs.110).aspx "IEnumerable.All<TSource> in .NET 4.5").

These methods are similar to `.forEach` in that they also take a callback with `value`, `index`, and `array`, which can be context-bound passing a second argument. The MDN docs describe `.some`:

> `some` executes the callback function once for each element present in the array until it finds one where `callback` returns a `true` value. If such an element is found, `some` immediately returns `true`. Otherwise, `some` returns `false`. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.

```js
max = -Infinity
satisfied = [10, 12, 10, 8, 5, 23].some(function (value, index, array) {
	if (value > max) max = value
	return value < 10
})

console.log(max)
// <- 12

satisfied
// <- true
```

Note that the function stopped looping after it hit the first item which satisfied the callback's condition `value < 10`. `.every` works in the same way, but short-circuits happen when your callback returns `false`, rather than `true`.

### Stacks and queues with `.pop`, `.push`, `.shift`, and `.unshift`

Nowadays, everyone knows that _adding elements to the end of an array_ is done using `.push`. Did you know that you can push many elements at once using `[].push('a', 'b', 'c', 'd', 'z')`?

The `.pop` method is the counterpart of the most common use for `.push`. It'll return the last element in the array, and remove it from the array at the same time. If the array is empty, [`void 0` (`undefined`)](http://stackoverflow.com/questions/7452341/what-does-void-0-mean "void operator - MDN") is returned. Using `.push` and `.pop` we could easily create a [LIFO (last in first out)](http://en.wikipedia.org/wiki/LIFO_(computing) "LIFO on Wikipedia") stack.

```js
function Stack () {
	this._stack = []
}

Stack.prototype.next = function () {
	return this._stack.pop()
}

Stack.prototype.add = function () {
	return this._stack.push.apply(this._stack, arguments)
}

stack = new Stack()
stack.add(1,2,3)

stack.next()
// <- 3
```

Inversely, we could create a [FIFO (first in first out)](http://en.wikipedia.org/wiki/FIFO "FIFO on Wikipedia") queue using `.unshift` and `.shift`.

```js
function Queue () {
	this._queue = []
}

Queue.prototype.next = function () {
	return this._queue.shift()
}

Queue.prototype.add = function () {
	return this._queue.unshift.apply(this._queue, arguments)
}

queue = new Queue()
queue.add(1,2,3)

queue.next()
// <- 1
```

Using `.shift` (or `.pop`) is an easy way to loop through a set of array elements, while draining the array in the process.

```js
list = [1,2,3,4,5,6,7,8,9,10]

while (item = list.shift()) {
	console.log(item)
}

list
// <- []
```

### Model mapping with `.map`

> `map` calls a provided callback function once for each element in an array, in order, and constructs a new array from the results. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.

The [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map "Array.prototype.map - MDN") method has the same signature we've seen in `.forEach`, `.some`, and `.every`: `.map(fn(value, index, array), thisArgument)`.

```js
values = [void 0, null, false, '']
values[7] = void 0
result = values.map(function(value, index, array){
    console.log(value)
    return value
})

// <- [undefined, null, false, '', undefined × 3, undefined]
```

The `undefined × 3` values explain that while `.map` won't run for deleted or unassigned array elements, they'll be still included in the resulting array. Mapping is very useful for casting or transforming arrays.

```js
// casting
[1, '2', '30', '9'].map(function (value) {
	return parseInt(value, 10)
})
// 1, 2, 30, 9

[97, 119, 101, 115, 111, 109, 101].map(String.fromCharCode).join('')
// <- 'awesome'

// a commonly used pattern is mapping to new objects
items.map(function (item) {
	return {
		id: item.id,
		name: computeName(item)
	}
})
```

### Querying with `.filter`

> `filter` calls a provided callback function once for each element in an array, and constructs a new array of all the values for which `callback` returns a `true` value. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values. Array elements which do not pass the `callback` test are simply skipped, and **are not included** in the new array.

Same as usual: `.filter(fn(value, index, array), thisArgument)`. Think of it as the `.Where(x => x.IsAwesome)` LINQ expression (if you're into C#), or the `WHERE` SQL clause. Considering `.filter` only returns elements which pass the `callback` test with a truthy value, there are some interesting use cases.

```js
[void 0, null, false, '', 1].filter(function (value) {
	return value
})
// <- [1]

[void 0, null, false, '', 1].filter(function (value) {
	return !value
})
// <- [void 0, null, false, '']
```

### Ordering with `.sort(compareFunction)`

> If `compareFunction` is not supplied, elements are sorted by converting them to strings and comparing strings in lexicographic ("dictionary" or "telephone book," not numerical) order. For example, "80" comes before "9" in lexicographic order, but in a numeric sort 9 comes before 80.

Like most sorting functions, `Array.prototype.sort(fn(a,b))` takes a callback which tests two elements, and should produce one of three return values:

- return value `< 0` if `a` comes before `b`
- return value `=== 0` if both `a` and `b` are considered equivalent
- return value `> 0` if `a` comes after `b`

[examples!]

[...]

- Computing with `.reduce`, `.reduceRight`
- Copying a `.slice`
- The power of `.splice`
- Lookups with `indexOf`
- The `in` operator
- Going in `.reverse`
- Subtleties in `.join` and `.concat`
- Memoization

  [1]: http://i.imgur.com/z0Hun2i.png

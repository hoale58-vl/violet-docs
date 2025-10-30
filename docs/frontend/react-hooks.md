# React Hooks Best Practices

Common patterns and best practices for React Hooks.

## useState

Keep state as simple and flat as possible:

```jsx live
function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
```

## useEffect

Common useEffect patterns:

```jsx
// Run once on mount
useEffect(() => {
  fetchData();
}, []);

// Run when dependency changes
useEffect(() => {
  updateTitle(name);
}, [name]);

// Cleanup function
useEffect(() => {
  const subscription = subscribeToData();
  return () => subscription.unsubscribe();
}, []);
```

## Custom Hooks

Extract reusable logic:

```jsx live
function useToggle(initialValue = false) {
  const [value, setValue] = React.useState(initialValue);

  const toggle = React.useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle];
}

function ToggleExample() {
  const [isOn, toggleIsOn] = useToggle(false);

  return (
    <div>
      <p>The switch is {isOn ? 'ON' : 'OFF'}</p>
      <button onClick={toggleIsOn}>
        Toggle
      </button>
    </div>
  );
}
```

## Performance Optimization

### useMemo
Memoize expensive computations:

```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### useCallback
Memoize callback functions:

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## Common Mistakes to Avoid

1. **Don't call hooks conditionally**
   ```jsx
   // ❌ Bad
   if (condition) {
     useEffect(() => {});
   }

   // ✅ Good
   useEffect(() => {
     if (condition) {
       // do something
     }
   }, [condition]);
   ```

2. **Don't forget dependencies**
   ```jsx
   // ❌ Bad - missing dependency
   useEffect(() => {
     console.log(count);
   }, []);

   // ✅ Good
   useEffect(() => {
     console.log(count);
   }, [count]);
   ```

## Tags

`react`, `hooks`, `javascript`, `frontend`

---

*Last updated: 2025-10-30*
